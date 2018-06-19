import { h, Component } from 'preact';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import shaka from 'shaka-player';
import debounce from 'debounce';
import { updateDataVolume, getDataVolumeDownloaded } from '../utils/download'
import SettingsManager from '../utils/settings-manager';
import Loadable from '@7rulnik/react-loadable';
import Chromecaster from '../utils/chromecast';
import Constants from '../constants';

import Loading from '../components/loading';
import TopBarHamburger from '../components/topbar-hamburger';
import SideNav from '../components/side-nav';
import MiniPlayer from '../components/mini-player';
import Player from '../components/player';
import NavBar from '../components/navbar';
import Audio from '../components/audio';

const Library = Loadable({
  loader: () => import('./library' /* webpackPrefetch: true, webpackChunkName: "route-library" */),
  loading: Loading,
  timeout: 10000
});

const TrackList = Loadable({
  loader: () => import('./tracklist' /* webpackPrefetch: true, webpackChunkName: "route-tracklist" */),
  loading: Loading,
  timeout: 10000
});

const Playlists = Loadable({
  loader: () => import('./playlists', /* webpackPrefetch: true, webpackChunkName: "route-playlists" */),
  loading: Loading,
  timeout: 10000
});

const Settings = Loadable({
  loader: () => import('./settings', /* webpackPrefetch: true, webpackChunkName: "route-settings" */),
  loading: Loading,
  timeout: 10000
});

const Upload = Loadable({
  loader: () => import('./upload', /* webpackPrefetch: true, webpackChunkName: "route-upload" */),
  loading: Loading,
  timeout: 10000
})

const Demo = Loadable({
  loader: () => import('./demo-streaming', /* webpackPrefetch: true, webpackChunkName: "route-demo" */),
  loading: Loading,
  timeout: 10000
});

import About from './about';
import Licences from './licences';
import Search from './search';

import {
  getUserId
} from '../store/user';

import {
  restoreSettings
} from '../store/settings';

import {
  setPlayingStatus,
  switchPlayingStatus,
  setChromecastStatus,
  setPrevTrack,
  setNextTrack,
  setCurrentTime
} from '../store/player';

const mapStateToProps = state => ({
  userId: getUserId(state)
});

const mapDispatchToProps = dispatch => ({
  restoreSettings: _ => dispatch(restoreSettings()),
  setPlayingStatus: payload => dispatch(setPlayingStatus(payload)),
  setPrevTrack: _ => dispatch(setPrevTrack()),
  setNextTrack: payload => dispatch(setNextTrack(payload)),
  switchPlayingStatus: _ => dispatch(switchPlayingStatus()),
  setCurrentTime: time => dispatch(setCurrentTime(time))
});

class Home extends Component {
  constructor () {
    super();

    this.context = null;
    this.source = null;

    this.chromecaster = null;
    this.settings = new SettingsManager();

    this.audio = null;
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
  }

  componentDidMount () {
    this.initShakaPlayer();
    this.initMediaSession();
    this.initPresentation();
    this.offlineListener();
    this.props.restoreSettings();
  }

  initWebAudioApi () {
    // create a new audio context
    this.context = new (AudioContext || webkitAudioContext)();
    // bind the context to our <audio /> element
    this.source = this.context.createMediaElementSource(this.audio.base);
    // connect source to context
    // otherwise we could'nt hear anything from the audio element
    this.source.connect(this.context.destination);
  }

  initShakaPlayer () {
    // install shaka player polyfills
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser not supported by shaka-player...');
      return;
    }

    this.player = new shaka.Player(this.audio.base);
    this.castProxy = new shaka.cast.CastProxy(this.audio.base, this.player, Constants.PRESENTATION_ID);
    this.remoteAudio = this.castProxy.getVideo();
    this.remotePlayer = this.castProxy.getPlayer();

    requestAnimationFrame(this.trackTimeUpdate);
    this.remoteAudio.addEventListener('ended', _ => {
      this.setNextTrack({continuous: true});
    });

    // put it in window so it's easy to access
    // even in console.
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
         updateDataVolumeDebounced({userId: this.props.userId, value});
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
    // TODO: use redux store cache
    const limit = await this.settings.get('limit-data');
    if (limit) {
      const [{volume}, max] = await Promise.all([
        getDataVolumeDownloaded({userId: this.props.userId}),
        this.settings.get('data-max')
      ]);

      //console.log(volume, max);
      //console.log('cached: ', await caches.has(`${Constants.CDN_URL}/${manifest}`));

      // if user has exceed data limit
      // prevent streaming unless it's downloaded one.
      // note: downloaded music = manifest in cache
      if (volume > max && (Constants.SUPPORT_CACHE_API && !await caches.match(`${Constants.CDN_URL}/${manifest}`))) {
        console.log(`${Constants.CDN_URL}/${manifest}`, await caches.match(`${Constants.CDN_URL}/${manifest}`));
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
    // TODO: does not seem to work :(
    // maybe problem with <audio> element.
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
    // switch status in store
    this.props.switchPlayingStatus();
    // update audio
    playing ? this.pause() : this.play();
  }

  play () {
    return this.remoteAudio.play();
    //return this.audio.base.play();
  }

  pause () {
    return this.remoteAudio.pause();
    //return this.audio.base.pause();
  }

  seekBackward () {
    const time = Math.max(0, this.audio.base.currentTime - this.skipTime);
    this.seek(time);
  }

  seekForward () {
    const time = Math.min(this.audio.base.duration, this.audio.base.currentTime + this.skipTime);
    this.seek(time);
  }

  changeVolume (volume) {
    this.remoteAudio.volume = volume / 100;
    //this.audio.base.volume = volume / 100;
  }

  seek (time) {
    this.remoteAudio.currentTime = time;
    //this.audio.base.currentTime = time;
  }

  setPrevTrack () {
    const currentTime = this.audio.base.currentTime;
    // if we have listened more than 2 sec, simply replay the current audio
    if (currentTime > 2) {
      this.seek(0);
      return;
    }

    // update redux state, get new current track, play it
    this.props.setPrevTrack().then(({manifestURL, playlistHLSURL, trackInfos}) => {
      this.listen(manifestURL, playlistHLSURL, trackInfos, true);
    });
  }

  setNextTrack (continuous) {
    this.props.setNextTrack(continuous).then(({manifestURL, playlistHLSURL, trackInfos, play}) => {
      this.listen(manifestURL, playlistHLSURL, trackInfos, play);
    });
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

  render () {
    return (
      <section class="home">
        <TopBarHamburger />
        <SideNav />
        <Switch>
          <Route exact path="/" component={Library} />
          <Route exact path="/album/:id"
            render={props => <TrackList listen={this.listen} type='album' {...props} />}
          />
          <Route exact path="/playlist/:id"
            render={props => <TrackList listen={this.listen} type='playlist' {...props} />}
          />
          <Route exact path="/playlist" component={Playlists} />
          <Route exact path="/search"
            render={props => <Search listen={this.listen} {...props} />}
          />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/about" component={About} />
          <Route exact path="/licences" component={Licences} />
          <Route exact path="/upload" component={Upload} />
          <Route exact path="/demo" component={Demo} />
        </Switch>
        <Player
          ref={player => this.playerEl = player}
          onPlayClick={this.onPlayClick}
          prev={this.setPrevTrack}
          next={this.setNextTrack}
          chromecast={this.chromecast}
          onVolumeChange={this.changeVolume}
          seek={this.seek}
        />
        <section class="home__mini-player-and-navbar-container">
          <MiniPlayer
            //listen={this.listen}
            onPlayClick={this.onPlayClick}
            prev={this.setPrevTrack}
            next={this.setNextTrack}
            chromecast={this.chromecast}
            seek={this.seek}
          />
          <NavBar />
        </section>
        <Audio
          ref={audio => this.audio = audio}
          preload="metadata"
          next={this.setNextTrack}
          //crossFade={this.crossFade}
        />
        <Audio
          ref={audio => this.audioNext = audio}
          preload="metadata"
          next={this.setNextTrack}
          //crossFade={this.crossFade}
        />
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
