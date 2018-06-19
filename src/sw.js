importScripts("/third_party/idb-keyval.min.js");
importScripts('/cache-manifest.js');

const CACHENAME = 'static';
const VERSION = '1';
const CACHE_MANIFEST_NAME = `${CACHENAME}-v${VERSION}`;
const MUSIC_CACHE_NAME = 'streamwave-music-cache';


self.oninstall = event => {
  event.waitUntil(async function () {
    const cache = await caches.open(`${CACHENAME}-v${VERSION}`);
    return await cache.addAll(cacheManifest);
  }());
  self.skipWaiting();
}

self.onactivate = event => {
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        // avoid removing irrelevant caches
        if (!cacheName.startsWith(CACHENAME)) {
          return null;
        }

        // remove old cache manifest
        if (cacheName !== CACHE_MANIFEST_NAME) {
          return caches.delete(cacheName);
        }
      })
    );
  });
  self.clients.claim();
}

self.onfetch = event => {
  // https://github.com/paulirish/caltrainschedule.io/pull/51
  // seems kind of a bug with chrome devtools open
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }

  // bail non get requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // network-first for playlists list
  if (url.href === 'https://api.streamwave.be/v1/playlists') {
    return networkFirst(event);
  }

  // api call (library, album, playlist)
  if (url.hostname === 'api.streamwave.be') {
    // get something from the cache then update it
    return staleWhileRevalidate(event);
  }

  // artworks
  if (url.hostname === 'cdn.streamwave.be' && url.pathname.endsWith('.jpg')) {
    return staleWhileRevalidate(event);
  }

  // google avatar
  if (url.hostname.includes('googleusercontent.com')) {
    return staleWhileRevalidate(event);
  }

  event.respondWith(async function () {
    // console.log(event.request.url);
    // console.log(await caches.match(event.request));
    // console.log(fetch(event.request));

    // cached stuff (e.g. static files - cache-manifest / routes)
    const response = await caches.match(event.request);

    if (!response) {
      return fetch(event.request);
    }

    // range-request (music)
    const rangeHeader = event.request.headers.get('Range');
    // console.log(rangeHeader);

    if (rangeHeader) {
      return createRangedResponse(event.request, response, rangeHeader);
    }

    return response;
  }());
}

self.onbackgroundfetched = event => {
  // console.log(event.id);
  if (event.id.startsWith('album-upload')) {
    event.updateUI('Album téléversé.');
    return;
  }

  event.waitUntil(async function () {
    // open the cache
    const cache = await caches.open(MUSIC_CACHE_NAME);
    // put the downloaded stuff in the cache
    await Promise.all(event.fetches.map(({request, response}) => cache.put(request, response)));
    // update UI. Yeah, there's an event for that !
    event.updateUI('Tracklist téléchargée.');
  }());
}

self.onbackgroundfetchfail = event => {
  // console.log(event);
  if (event.id.startsWith('album-upload')) {
    event.updateUI('Téléversement raté !');
    return;
  }

  event.updateUI('Erreur lors du téléchargement de la tracklist !');
}

self.onbackgroundfetchclick = event => {
  console.log(event);
  clients.openWindow(location.origin);
}

self.onsync = event => {
  if (event.tag === 'foreground-download') {
    // TODO: delay bg-sync if we are on cellular network
    // and it is not allowed to download with that network
    event.waitUntil(downloadInForeground());
  } else if (event.tag === 'bg-sync-add-to-playlist') {
    event.waitUntil(uploadInForeground());
  }
}

self.onpush = event => {
  const {message, album} = event.data.json();
  const options = {
    body: message,
    icon:  `https://cdn.streamwave.be/${album}/${album}.jpg`, //'/assets/icons/icon-192x192.png',
    vibrate: [200],
    data: {}
  }

  event.waitUntil(
    self.registration.showNotification('Streamwave', options)
  );
}

self.onnotificationclick = event => {
  const {type, id} = event.notification.data;
  // close notification
  event.notification.close();
  // redirect user
  if (type && id) {
    clients.openWindow(`${location.origin}/${type}/${id}`);
    return;
  }

  clients.openWindow(`${location.origin}`);
}

const networkFirst = event => {
  const {request} = event;
  const fetched = fetch(request);
  // perform a copy a fetched version
  // as we could consume it twice (fetch + put in cache)
  const fetchedClone = fetched.then(response => response.clone());

  event.respondWith(async function () {
    try {
      const response = await fetched;
      return response;
    } catch (err) {
      return caches.match(request);
      console.error(err);
    }
  }());

  event.waitUntil(async function () {
    try {
      const response = await fetchedClone;
      const cache = await caches.open('streamwave-api');
      cache.put(request, response);
    } catch (err) {
      console.error(err);
    }
  }());
}

const staleWhileRevalidate = event => {
  const {request} = event;
  const cached = caches.match(request);
  const fetched = fetch(request);
  // perform a copy a fetched version
  // as we could consume it twice (fetch + put in cache)
  const fetchedClone = fetched.then(response => response.clone());

  event.respondWith(async function () {
    try {
      // try to get response from the cache and from the network
      // fastest response will be returned
      // if offline, fetch could fail before we get something from the cache
      // in that case => return cached version
      const response = await Promise.race([
        cached,
        fetched.catch(_ => cached)
      ]);

      // if cached version fails
      // fetch request
      if (!response) {
        return await fetched;
      }

      return response;
    } catch (err) {
      // offline + nothing in the cache
      // 404
      console.error(err);
      return new Response(null, {status: 404});
    }
  }());

  event.waitUntil(async function () {
    try {
      const response = await fetchedClone;
      const cache = await caches.open('streamwave-api');
      cache.put(request, response);
    } catch (err) {
      console.error(err);
    }
  }());
}

const downloadInForeground = async () => {
  try {
    // seems like chrome (hopefully other browsers - to test) will retry until 3 times
    // if promise reject (lost connection,...)
    // https://notes.eellson.com/2018/02/11/chrome-the-background-sync-api-and-exponential-backoff/
    // check if mobile network downloading is allowed by user
    // and if we are on mobile network
    const mobileNetworkAllowed = await idbKeyval.get('download-mobile-network');

    if (!mobileNetworkAllowed && isOnMobileNetwork()) {
      self.registration.showNotification('Vouss n\'avez pas autorisé le téléchargement sur réseau mobile.', {
        body: 'Vous êtes sur un réseau mobile.\n Autorisez le téléchargement sur ce type de réseau dans les paramètres ou activez le Wifi.',
        data: {type: 'settings'}
      });
      // make promise reject to trigger a retry
      return Promise.reject();
    }

    const toCache = await idbKeyval.get('bg-sync-queue');

    // download each tracklist
    // feedback in ui
    // type = album or playlist
    await Promise.all(toCache.map(async ({requests, tracklistId, type}) => {
      const files = await requests.map(request => ({request, response: fetch(request)}));
      const responses = await Promise.all(files.map(file => file.response));


      trackDownload(responses, tracklistId);
      const cache = await caches.open(MUSIC_CACHE_NAME);
      await Promise.all(files.map(file => file.response.then(response => cache.put(file.request, response))));
      self.registration.showNotification('Liste de lecture téléchargée.', {
        // could show more infos.
        body: 'Accéder à la liste de lecture.',
        // usefull to redirect user when
        // he clicks on the notification
        data: {type, id: tracklistId}
      });
    }));

    // clean bg-sync-queue
    await idbKeyval.set('bg-sync-queue', []);
  } catch (err) {
    console.error(err);
  }
}

const uploadInForeground = async () => {
  try {
    // get stuff to upload
    const toUpload = await idbKeyval.get('bg-sync-playlist-queue');

    await Promise.all(toUpload.map(async ({playlistId, track, token}) => {
      const response = await fetch(`https://api.streamwave.be/v1/playlist/${playlistId}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify(track)
      });

      const data = await response.json();
      let notificationMessage, error;

      if (!data) {
        error = true;
        notificationMessage = 'Impossible d\'ajouter le titre.';
      } else {
        error = false;
        notificationMessage = 'Titre ajouté à la playlist';
      }

      self.registration.showNotification(notificationMessage, {
        // could show more infos.
        body: error ? 'Veuillez réessayer' : 'Accéder à la playlist.',
        // usefull to redirect user when
        // he clicks on the notification
        data: {type: 'playlist', id: playlistId}
      });
    }));

    // clean bg-sync queue
    await idbKeyval.set('bg-sync-playlist-queue', []);
  } catch (err) {
    console.error(err);
  }
}

const createRangedResponse = (request, response, rangeHeader) => {
  return response.arrayBuffer().then(buffer => {
    // aaa-bbb, aaa, bbb
    let [full, start, end] = /(\d*)-(\d*)/.exec(rangeHeader);

    if (start === '') {
      start = buffer.byteLength - Number(end);
      end = buffer.byteLength;
    } else if (end === '') {
      start = Number(start);
      end = buffer.byteLength;
    } else {
      start = Number(start);
      end = Number(end) + 1;
    }

    if (start < 0 || end > buffer.byteLength) {
      return new Response('Range not satisfiable', {status: 416});
    }

    const slicedBuffer = buffer.slice(start, end);
    const slicedResponse = new Response(slicedBuffer, {
      status: 206,
      headers: response.headers
    });

    slicedResponse.headers.set('X-Shaka-From-Cache', 'true');
    slicedResponse.headers.set('Content-Length', slicedBuffer.byteLength);
    slicedResponse.headers.set('Content-Range', `bytes ${start}-${end - 1}/${buffer.byteLength}`);
    return slicedResponse;
  });
}

const trackDownload = (responses, tracklistId) => {
  let totalDownload, downloaded = 0;

  totalDownload = responses.reduce((total, response) => {
    const contentLength = parseInt(response.headers.get('content-length'), 10);
    return total += contentLength;
  }, 0);

  responses.map(response => {
    // response has been consumed
    // by cache api
    const cloned = response.clone();
    const onStream = ({done, value}) => {
      if (done) {
        // get all clients (window)
        // and show a ui feedback
        clients.matchAll({type: 'window'}).then(clients => {
          clients.forEach(client => client.postMessage({type: 'downloaded', tracklistId}));
        });
        return;
      }

      downloaded += value.length;
      clients.matchAll({type: 'window'}).then(clients => {
        clients.forEach(client => client.postMessage({type: 'downloading', tracklistId, downloaded, totalDownload, value: value.length}));
      });
      return reader.read().then(onStream);
    }

    const reader = cloned.body.getReader();
    reader.read().then(onStream);
  });
}

// network information api is not available in every browser for now
// connection.type seems to be possibly undefined in some case (desktop ?)
const isOnMobileNetwork = () => navigator.connection && navigator.connection.type && navigator.connection.type === 'cellular';
