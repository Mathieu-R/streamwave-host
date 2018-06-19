import { h, Component } from 'preact';
import { formatDuration } from '../utils';
import Constants from '../constants';

class Track extends Component {
  constructor () {
    super();
    this.onClick = this.onClick.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
  }

  shouldComponentUpdate (nextProps) {
    if (nextProps.title !== this.props.title) {
      return true;
    }

    if (nextProps.currentTrackId !== this.props.currentTrackId) {
      return true;
    }

    return false;
  }

  onClick (evt) {
    const {track} = this.props;
    this.props.handleTrackClick(track);
  }

  removeTrack (evt) {
    // prevent track to play
    evt.stopPropagation();
    this.props.removeTrack(this.props.id);
  }

  render ({number, title, duration, id, manifest, currentTrackId, type}) {
    return (
      <div class={
        id === currentTrackId ?
        'track track--active' :
        'track'
        } data-manifest={manifest} onClick={this.onClick}>
        <div class="track__number">{number}</div>
        <div class="track__title">{title}</div>
        <div class="track__duration">{formatDuration(duration)}</div>
        {
          type === 'playlist' &&
          <button class="track__remove" onClick={this.removeTrack}></button>
        }
      </div>
    );
  }
}

export default Track;
