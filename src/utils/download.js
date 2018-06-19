import { get, set, del } from 'idb-keyval';
import store from '../store';
import { flatten } from '../utils';
import Constants from '../constants';

import { setDownloadPercentage, removeDownloadPercentage } from '../store/player';
import { toasting } from '../store/toast';

const MUSIC_CACHE_NAME = 'streamwave-music-cache';

async function getRequestsUrls (tracklist, cover) {
  const qualities = {
    '128': 'audio128URL',
    '192': 'audio192URL',
    '256': 'audio256URL'
  };

  const quality = store.getState().settings.downloadQuality;
  const urls = tracklist.map(track => {
    const audio = track[qualities[quality]];
    const {manifestURL, playlistHLSURL} = track;
    return [audio, manifestURL, playlistHLSURL].map(url => `${Constants.CDN_URL}/${url}`);
  });

  if (cover) {
    return [...flatten(urls), `${Constants.CDN_URL}/${cover}`];
  }

  // tracklists have no cover
  return flatten(urls);
}

// download without bg-sync or bg-fetch
// directly put the response into the cache
// with that all major browsers support download
export async function simpleDownloadTracklist ({tracklist, cover, id: tracklistId}) {
  const requests = await getRequestsUrls(tracklist, cover);

  // note: simple copy-paste from service-worker
  const files = await requests.map(request => ({request, response: fetch(request)}));
  const responses = await Promise.all(files.map(file => file.response));
  // only track download if browser support readable streams (FF does not)
  if (Constants.SUPPORT_STREAMS) {
    trackDownload(responses, tracklistId);
  }

  const cache = await caches.open(MUSIC_CACHE_NAME);
  await Promise.all(files.map(file => file.response.then(response => cache.put(file.request, response))));

  return store.dispatch(toasting([
    'Tracklist téléchargée.',
    'Vous pouvez désormais l\'écouter hors-ligne'
  ], ['dismiss'], 5000));
}

export async function downloadTracklist ({tracklist, cover, id: tracklistId, type}) {
  console.log('download');
  const registration = await navigator.serviceWorker.ready;

  if (!registration.active) {
    return;
  }

  // ask user permission to show notification
  await Notification.requestPermission();

  // get all requests url
  const requests = await getRequestsUrls(tracklist, cover);
  // stuff to cache
  const toCache = {requests, tracklistId, type};

  // retrieve bg-sync queue if any (in case of multiple tracklist download)
  const bgSyncQueue = await get('bg-sync-queue') || [];

  // add stuff to queue, avoid double
  set('bg-sync-queue', Array.from(new Set([...bgSyncQueue, toCache])));

  await registration.sync.register('foreground-download');
}

export async function removeTracklistFromCache (tracklist, id) {
  console.log('remove tracklist');
  const cache = await caches.open(MUSIC_CACHE_NAME);
  const keys = await cache.keys();

  const toRemoveFromCache = tracklist.map(({audio256URL, manifestURL, playlistHLSURL}) => {
    // remove "-quality.mp4"
    const normalizedAudioURL = audio256URL.replace(/-[^-]*$/, '');
    // find request for that url
    const request = keys.find(request => request.url.startsWith(`${Constants.CDN_URL}/${normalizedAudioURL}`));
    return [
      cache.delete(request),
      cache.delete(manifestURL),
      cache.delete(playlistHLSURL)
    ];
  });

  const flattened = flatten(toRemoveFromCache);
  await Promise.all(flattened);
  // or set(id, {downloaded: false}) ?
  return del(id);
}

// uses background fetch which is for now only available in chrome canary
// or in chrome stable behind a flag (experimental web platform features)
// https://github.com/WICG/background-fetch
export async function downloadTracklistInBackground ({tracklist, album, cover, id}) {
  // get the active service-worker
  const registration = await navigator.serviceWorker.ready;

  // no active service-worker
  if (!registration.active) {
    return;
  }

  // dispatch toasting so we inform the user in UI
  store.dispatch(toasting([
    'Votre tracklist va être téléchargée en arrière-plan.',
    'Vous pouvez fermer l\'application si vous le désirez.'
  ], ['dismiss'], 5000));

  // store the tracklist in idb in case we would lost internet connection
  // not sure I need to do that
  //await set(`background-fetch-${id}`, tracklist);

  // background fetch options
  const icons = [
    {
      "src": "/assets/icons/icon-128x128.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/assets/icons/icon-192x192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ];

  const options = {
    icons,
    title: `Téléchargement de "${album}" en arrière-plan pour la lecture hors-ligne.`
  }

  // get requests urls
  const requests = await getRequestsUrls(tracklist, cover);
  console.log(requests);
  // launch a background fetch
  const bgFetch = await registration.backgroundFetch.fetch(id, requests, options);
  console.log(bgFetch);
}

export function updateDataVolume ({userId, value}) {
  if (!userId) return;

  return get(`data-volume_${userId}`).then(volume => {
    let newDataVolume;

    // if volume has never been set
    if (volume === undefined) {
      newDataVolume = value;
    } else {
      newDataVolume = volume + value;
    }

    return set(`data-volume_${userId}`, newDataVolume);
  }).catch(err => console.error(err));
}

export function getDataVolumeDownloaded ({userId}) {
  return get(`data-volume_${userId}`).then(volume => {
    let volumeInMo;

    // user has no data downloaded
    if (!volume) {
      volumeInMo = 0;
    } else {
      // volume in bytes
      // 1 byte = 8bits
      volumeInMo = volume / (1000 * 1024);
    }

    return {
      volume: parseFloat(volumeInMo.toFixed(1))
    }
  }).catch(err => console.error(err));
}

export function resetDataVolume () {
  const userId = store.getState().user.id;
  return set(`data-volume_${userId}`, 0);
}

export function trackDownload (responses, tracklistId) {
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
        store.dispatch(removeDownloadPercentage({id: tracklistId}));
        return;
      }

      downloaded += value.length;
      store.dispatch(setDownloadPercentage({id: tracklistId, percentage: (downloaded / totalDownload)}));
      return reader.read().then(onStream);
    }

    const reader = cloned.body.getReader();
    reader.read().then(onStream);
  });
}
