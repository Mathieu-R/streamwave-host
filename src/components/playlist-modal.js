import { h, Component } from 'preact';
import { connect } from 'react-redux';
import { get, set } from 'idb-keyval';
import Constants from '../constants';

import {
  toasting
} from '../store/toast';

import {
  getPlaylists,
  createPlaylist,
  fetchPlaylists
} from '../store/playlists';

const mapStateToProps = state => ({
  playlists: getPlaylists(state)
})

const mapDispatchToProps = dispatch => ({
  toasting: (messages, buttons, duration) => dispatch(toasting(messages, buttons, duration)),
  fetchPlaylists: _ => dispatch(fetchPlaylists()),
  createPlaylist: payload => dispatch(createPlaylist(payload)),
});

class PlaylistModal extends Component {
  constructor () {
    super();

    this.blockClick = this.blockClick.bind(this);
    this.showPlaylistInput = this.showPlaylistInput.bind(this);
    this.removePlaylistInput = this.removePlaylistInput.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
    this.addTrackToPlaylist = this.addTrackToPlaylist.bind(this);

    this.state = {
      showPlaylistInput: false
    }
  }

  componentDidMount () {
    this.props.fetchPlaylists();
  }

  blockClick (evt) {
    // prevent playlist modal to disappear when we click on it
    // because of event bubbling
    evt.stopPropagation();
  }

  showPlaylistInput () {
    this.setState({showPlaylistInput: true});
  }

  removePlaylistInput () {
    this.setState({showPlaylistInput: false});
  }

  createPlaylist (evt) {
    if (!(evt.type === 'keydown' && evt.keyCode === 13)) {
      return;
    }

    if (this.input.value === '') {
      return;
    }

    this.props.createPlaylist({title: this.input.value})
      .then(_ => {
        // reset input value
        this.input.value = '';
      })
      .catch(msg => this.props.toasting(msg));
  }

  addTrackToPlaylist (evt) {
    const playlistId = evt.target.dataset.id;
    const {track} = this.props;
    // if bg-sync supported
    // register a bg-sync event so user can add
    // track to playlist even offline
    if (Constants.SUPPORT_BACKGROUND_SYNC && Constants.PRODUCTION) {
      this.addTrackWhenConnectionAvailable({playlistId, track});
      return
    }

    // if bg-sync not supported
    // try to add track directly
    // if no connection => fail.
    this.addTrackDirectly({playlistId, track}).catch(err => {
      // failed
      // no internet connection ?
      this.props.toasting(['Impossible d\'ajouter le titre.', 'Vérifier votre connexion internet.'], ['dismiss'], 5000);
      console.error(err);
    });
  }


  async addTrackDirectly ({playlistId, track}) {
    const response = await fetch(`${Constants.API_URL}/playlist/${playlistId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('streamwave-token')}`
      },
      body: JSON.stringify(track)
    });

    const data = await response.json();

    if (!data) {
      this.props.toasting(['Impossible d\'ajouter le titre.'], ['dismiss'], 5000);
      return;
    }

    this.props.toasting(['Titre ajouté à la playlist']);
    this.props.removePlaylistModal();
  }

  async addTrackWhenConnectionAvailable ({playlistId, track}) {
    const registration = await navigator.serviceWorker.ready;

    if (!registration.active) {
      return;
    }

    // ask user permission to show notification
    await Notification.requestPermission();

    // stuff to cache
    // service-worker has no access
    // to localstorage
    // so doing a workaround here
    const toCache = {
      playlistId,
      track,
      token: localStorage.getItem('streamwave-token')
    };

    // retrieve bg-sync queue if any (in case of multiple add)
    const bgSyncQueue = await get('bg-sync-playlist-queue') || [];

    // add stuff to queue, avoid double
    set('bg-sync-playlist-queue', Array.from(new Set([...bgSyncQueue, toCache])));

    // register background sync event
    await registration.sync.register('bg-sync-add-to-playlist');
    this.props.removePlaylistModal();
  }

  render ({show, removePlaylistModal, trackId, playlists}, {showPlaylistInput}) {
    const pluralize = (string, len) => len > 1 ? string + 's' : string;
    return (
      <div class={
        show ?
        'overlay overlay--visible' :
        'overlay'
      } onClick={removePlaylistModal}>
        <div class={
          show ?
          'playlist-modal playlist-modal--visible' :
          'playlist-modal'
        } onClick={this.blockClick}>
          <section class="playlist-modal__create-container">
            <button class="playlist-modal__create-button" onClick={this.showPlaylistInput} aria-label="create playlist">Créer une nouvelle playlist</button>
            <div class={
              showPlaylistInput ?
              'playlist-modal__create-input-container playlist-modal__create-input-container--visible' :
              'playlist-modal__create-input-container'
            }>
              <button class="playlist-modal__create-back" onClick={this.removePlaylistInput} aria-label="cancel playlist creation"></button>
              <input
                class="playlist-modal__create-input"
                ref={input => this.input = input}
                type="text"
                placeholder="Nom de la playlist..."
                onKeyDown={this.createPlaylist} />
            </div>
          </section>
          <section class="playlist-modal__playlists">
            {
              playlists.map(playlist =>
                <button class="playlist-modal__playlist" data-id={playlist._id} key={playlist._id} onClick={this.addTrackToPlaylist} aria-label="add to this playlist">
                  <span class="playlist-modal__playlist__title">{playlist.title}</span>
                  <span class="playlist-modal__playlist__tracks-counter">{playlist.tracks.length} {pluralize('titre', playlist.tracks.length)}</span>
                </button>
              )
            }
          </section>
          <button class="playlist-modal__cancel" onClick={removePlaylistModal}>Annuler</button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistModal);
