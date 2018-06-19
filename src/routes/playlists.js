import { h, Component } from 'preact';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { pluralize } from '../utils';
import Constants from '../constants';
import { toasting } from '../store/toast';

const mapDispatchToProps = dispatch => ({
  toasting: (messages, buttons, duration) => dispatch(toasting(messages, buttons, duration))
});

class Playlists extends Component {
  constructor () {
    super();
    this.removePlaylist = this.removePlaylist.bind(this);

    this.state = {
      playlists: []
    }
  }

  componentWillMount () {
    fetch(`${Constants.API_URL}/playlists`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('streamwave-token')}`
      }
    })
    .then(response => response.json())
    .then(playlists => this.setState({playlists}));
  }

  removePlaylist (evt) {
    // block link
    evt.preventDefault();
    const remove = confirm('Etes-vous sûr de vouloir supprimer cette playlist ?');
    if (!remove) {
      return;
    }

    const id = evt.target.dataset.id;
    fetch(`${Constants.API_URL}/playlist/${id}`, {
      method: 'delete',
      headers: {
        authorization: `Bearer ${localStorage.getItem('streamwave-token')}`
      }
    })
    .then(response => {
      if (response.status === 200) {
        this.updateState(id);
        this.props.toasting(['Playlist supprimée.'], ['dismiss']);
      }
    })
    .catch(err => console.error(err));
  }

  updateState (playlistId) {
    const index = this.state.playlists.findIndex(p => p._id === playlistId);
    this.setState({
      playlists: [...this.state.playlists.slice(0, index), ...this.state.playlists.slice(index + 1)]
    });
  }

  render ({}, {playlists}) {
    return (
      <div class="playlists">
        <section class="playlists__wrapper">
          {playlists.map((playlist, index) => (
            <Link class="playlists__link" to={`/playlist/${playlist._id}`} key={playlist._id}>
              <div class="playlists__playlist">
                <span class="playlists__title">{playlist.title}</span>
                <span class="playlists__tracks-counter">{playlist.tracks.length} {pluralize('titre', playlist.tracks.length)}</span>
                <button class="playlists__remove" data-id={playlist._id} onClick={this.removePlaylist}></button>
              </div>
            </Link>
          ))}
        </section>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Playlists);
