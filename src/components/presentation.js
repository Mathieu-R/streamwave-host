import { h, Component } from 'preact';
import shaka from 'shaka-player';
import ProgressBar from './progress-bar-presentation';
import { formatDuration } from '../utils';
import Constants from '../constants';

// lazy-load presentation css
// as only few users should need it
import '../style/chromecast/index';

class Presentation extends Component {
  constructor () {
    super();

    this.audio = null;
    this.player = null;

    this.updateTime = this.updateTime.bind(this);

    this.state = {
      artist: 'Borrtex',
      album: 'Ability',
      playing: true,
      currentTime: 7.82,
      totalTime: 153,
      manifestURL: 'ability/01-1451113-Borrtex-Ability/manifest-full.mpd',
      track: {
        duration: 353,
        title: 'Ability',
        coverURL: 'ability/ability.jpg',
      }
    }
  }

  componentDidMount () {
    if (!navigator.presentation.receiver) {
      console.warn('Presentation page not opened through Presentation API !');
      return;
    }

    this.initShakaPlayer();

    navigator.presentation.receiver.connectionList
      .then(list => {
        // the spec says to do that
        list.connections.map(connection => this.addConnection(connection));
        list.onconnectionavailable = evt => this.addConnection(evt.connection);
      })
      .catch(err => console.error(err));
  }

  initShakaPlayer () {
    // install shaka player polyfills
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser not supported by shaka-player...');
      return;
    }

    this.player = new shaka.Player(this.audio);

    // listen to errors
    this.player.addEventListener('error', err => console.error(err));
  }

  /**
   * Stream an audio with DASH (thanks to shaka-player)
   * @param {String} manifest manifest url
   */
  listen (manifest) {
    return this.player.load(`${Constants.CDN_URL}/${manifest}`).then(_ => {
      console.log(`[shaka-player] Music loaded: ${manifest}`);
      return this.audio.play();
    }).catch(err => {
      console.error(err);
    });
  }

  addConnection (connection) {
    connection.send('connected');
    //this.setState({debug: connection.id + ' ' + connection.state});
    // listen for messages event
    // we give all the informations about media by there
    // no redux store here
    connection.addEventListener('message', evt => {
      connection.send(event.data);

      const data = JSON.parse(evt.data);
      const {type} = data;

      if (type === 'song') {
        this.setState(data);
        this.listen(data.track.manifestURL);
        return;
      }

      if (type === 'seek') {
        this.audio.currentTime = data.currentTime;
        return;
      }

      if (type === 'volume') {
        this.audio.volume = data.volume;
        return;
      }
    });
  }

  updateTime (evt) {
    const {duration, currentTime} = this.audio;
    // onTimeUpdate fires up even when no audio is played.
    if (!duration) return;

    this.setState({currentTime});
  }

  render ({}, {
    artist, album, track,
    currentTime, playing, primaryColor, debug
  }) {
    if (!track) return null;
    return (
      <div class="presentation">
        <section class="presentation__cover-container">
          <div class="presentation__cover">
            <img class="presentation__artwork" src={track.coverURL && `${Constants.CDN_URL}/${track.coverURL}`} alt="cover artwork" />
          </div>
        </section>
        <section class="presentation__footer">
          <div class="presentation__progress-wrapper">
            <ProgressBar duration={track.duration} currentTime={currentTime} />
          </div>
          <section class="presentation__all-infos">
            <span class="presentation__current-time">{formatDuration(currentTime)}</span>
            <div class="presentation__infos">
              <span class="presentation__title">{track.title}</span>
              <span class="presentation__artist">{artist}</span>
              <span class="presentation__album">{album}</span>
            </div>
            <span class="presentation__total-time">{formatDuration(track.duration)}</span>
          </section>
        </section>
        <audio preload="metadata" ref={audio => this.audio = audio} onTimeUpdate={this.updateTime}></audio>
      </div>
    );
  }
}

export default Presentation;

