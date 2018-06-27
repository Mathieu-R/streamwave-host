import { updateDataVolume, getDataVolumeDownloaded } from './utils/download';
import SettingsManager from './utils/settings-manager';
import Chromecaster from './utils/chromecast';
import Constants from './constants';
import debounce from 'debounce';

class Player {
  constructor () {
    const audio = document.querySelector('audio');
    if (!audio) {
      return;
    }

    this.source = null;

    this.chromecaster = null;
    this.settings = new SettingsManager();

    this.audio = audio;
    this.player = null;
    this.castProxy = null;
    this.skipTime = 15;

    this.listen = this.listen.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.onPlayClick = this.onPlayClick.bind(this);
    this.seekBackward = this.seekBackward.bind(this);
    this.seekForward = this.seekForward.bind(this);
    this.setPrevTrack = this.setPrevTrack.bind(this);
    this.setNextTrack = this.setNextTrack.bind(this);
    this.chromecast = this.chromecast.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.trackTimeUpdate = this.trackTimeUpdate.bind(this);
    this.seek = this.seek.bind(this);

    this.initShakaPlayer();
    this.initMediaSession();
    this.initPresentation();
    this.offlineListener();
  }

  initShakaPlayer () {
    // install shaka player polyfills
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser not supported by shaka-player...');
      return;
    }

    this.player = new shaka.Player(this.audio);
    this.castProxy = new shaka.cast.CastProxy(this.audio, this.player, Constants.PRESENTATION_ID);
    this.remoteAudio = this.castProxy.getVideo();
    this.remotePlayer = this.castProxy.getPlayer();

    requestAnimationFrame(this.trackTimeUpdate);
    this.remoteAudio.addEventListener('ended', _ => {
      this.setNextTrack({continuous: true});
    });

    // put it in window so it's easy to access
    window.player = this.player;

    // listen to errors
    this.player.addEventListener('error', evt => {
      evt.detail.map(err => console.error(err));
    });

    // register a response filter in order to track streaming
    // chunk downloaded
    // https://github.com/google/shaka-player/issues/1416
    const networkEngine = this.player.getNetworkingEngine();
    const updateDataVolumeDebounced = debounce(updateDataVolume, 300);
    networkEngine.registerResponseFilter(async (type, response) => {
      //console.log(response);

      // user does not want to limit-data => do not track.
      const limit = await this.settings.get('limit-data');
      if (!limit) {
        return;
      }

      // we're only interested in segments requests
      if (type == shaka.net.NetworkingEngine.RequestType.SEGMENT) {
        // https://github.com/google/shaka-player/issues/1439
        const cached = Object.keys(response.headers).includes('X-Shaka-From-Cache');
        //console.log('segment from service-worker cache: ', cached);
        if (cached) {
          return;
        }

        // bytes downloaded
        const value = response.data.byteLength;
        // update idb cache to save the user data volume consumed
         updateDataVolumeDebounced(value);
         // fire an event for live-update
         const evt = new CustomEvent('data-volume', {
           detail: {value}, bubbles: true, cancelable: true
         });

         document.body.dispatchEvent(evt);
      }
    });
  }

  initMediaSession () {
    if (!Constants.SUPPORT_MEDIA_SESSION_API) {
      return;
    }

    navigator.mediaSession.setActionHandler('play', evt => {
      this.props.setPlayingStatus({playing: true});
      this.play();
    });
    navigator.mediaSession.setActionHandler('pause', evt => {
      this.props.setPlayingStatus({playing: false});
      this.pause();
    });
    navigator.mediaSession.setActionHandler('seekbackward', this.seekBackward);
    navigator.mediaSession.setActionHandler('seekforward', this.seekForward);
    navigator.mediaSession.setActionHandler('previoustrack', this.setPrevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', evt => this.setNextTrack({continuous: false}));
  }

  initPresentation () {
    this.chromecaster = new Chromecaster(this.castProxy);
  }

  /**
   * Stream an audio with DASH (thanks to shaka-player) or HLS (if dash not supported)
   * @param {String} manifest manifest url
   * @param {String} m3u8playlist  hls playlist url
   * @param {Object} trackInfos {artist, album, title, coverURL}
   * @param {Boolean} play play/pause media
   */
  async listen (manifest, m3u8playlist, trackInfos, play) {
    // update chromecast receiver UI (if needed)
    this.chromecaster.updateReceiverUI();
    const limit = await this.settings.get('limit-data');
    if (limit) {
      const [{volume}, max] = await Promise.all([
        getDataVolumeDownloaded(),
        this.settings.get('data-max')
      ]);

      // if user has exceed data limit
      // prevent streaming unless it's downloaded one.
      // note: downloaded music = manifest in cache
      if (volume > max && (Constants.SUPPORT_CACHE_API && !await caches.match(`${Constants.CDN_URL}/${manifest}`))) {
        return;
      }
    }

    // 1. Load the player
    return this.remotePlayer.load(`${Constants.CDN_URL}/${manifest}`).then(_ => {
      console.log(`[shaka-player] Music loaded: ${manifest}`);
      return play ? this.play() : this.pause();
    })
    // 2. Set media notification (Media Session API)
    .then(_ => this.setMediaNotifications(trackInfos))
    .catch(err => {
      // 3. If fails, fallback to HLS format (safari mobile)
      this.player.unload().then(_ => this.fallbackToHLS(m3u8playlist, trackInfos));
      console.error(err);
    });
  }

  fallbackToHLS (m3u8playlist, trackInfos) {
    // Simply put it in src attribute
    this.audio.base.src = `${Constants.CDN_URL}/${m3u8playlist}`;
    this.play().then(_ => this.setMediaNotifications(trackInfos));
  }

  setMediaNotifications ({artist, album, title, coverURL}) {
    if (!Constants.SUPPORT_MEDIA_SESSION_API) {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      artist,
      album,
      title,
      artwork: [
        {src: `${Constants.CDN_URL}/${coverURL}`, sizes: '256x256', type: 'image/png'},
        {src: `${Constants.CDN_URL}/${coverURL}`, sizes: '512x512', type: 'image/png'}
      ]
    });
  }

  onPlayClick ({playing}) {
    // TODO: change play button
    // update audio
    playing ? this.pause() : this.play();
  }

  play () {
    return this.remoteAudio.play();
  }

  pause () {
    return this.remoteAudio.pause();
  }

  seekBackward () {
    const time = Math.max(0, this.audio.currentTime - this.skipTime);
    this.seek(time);
  }

  seekForward () {
    const time = Math.min(this.audio.duration, this.audio.currentTime + this.skipTime);
    this.seek(time);
  }

  changeVolume (volume) {
    this.remoteAudio.volume = volume / 100;
  }

  seek (time) {
    this.remoteAudio.currentTime = time;
  }

  setPrevTrack () {
    const currentTime = this.audio.currentTime;
    // if we have listened more than 2 sec, simply replay the current audio
    if (currentTime > 2) {
      this.seek(0);
      return;
    }
  }

  setNextTrack (continuous) {

  }

  chromecast ({chromecasting, manifest}) {
    this.chromecaster.castIfNeeded();
  }

  offlineListener () {
    window.addEventListener('offline', _ => this.disableWhenOffline())
    window.addEventListener('online', _ => this.activateWhenOnline());
  }

  disableWhenOffline () {
    // get all the covers links
    const coverLinks = Array.from(document.querySelectorAll('.cover__link'));
    // disable albums that are not in the cache
    return Promise.all(coverLinks.map(link => {
      const url = new URL(link.href).pathname;
      return caches.match(`${Constants.API_URL}${url}`).then(cached => {
        if (!cached) {
          link.classList.add('cover--disabled');
        }
      });
    }));

    const tracks = Array.from(document.querySelectorAll('.track'));
    Promise.all(tracks.map(track => {
      const url = `${Constants.CDN_URL}/${track.dataset.manifest}`;
      return caches.match(url).then(cached => {
        if (!cached) {
          track.classList.add('track--disabled');
        }
      });
    }));
  }

  activateWhenOnline () {
    const coverLinks = Array.from(document.querySelectorAll('.cover__link'));
    coverLinks.forEach(link => {
      link.classList.remove('cover--disabled');
    });

    const tracks = Array.from(document.querySelectorAll('.track'));
    tracks.map(track => {
      track.classList.remove('track--disabled');
    });
  }

  trackTimeUpdate () {
    if (!this.remoteAudio) {
      return;
    }

    // ontimeupdate event does not allow me to have 60fps
    // cause it does not fire enough
    const {duration, currentTime} = this.remoteAudio;
    requestAnimationFrame(this.trackTimeUpdate);

    // bail if no music played
    if (!duration) {
      return;
    }

    // bail if audio paused
    if (this.remoteAudio.paused) {
      return;
    }

    this.props.setCurrentTime(currentTime);
  }
}

export default Player;
