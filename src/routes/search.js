import { h, Component } from 'preact';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import debounce from 'debounce';
import Constants from '../constants';
import { formatDuration } from '../utils';

import {
  setTrack,
  setQueue
} from '../store/player';

const mapDispatchToProps = dispatch => ({
  setTrack: (music) => dispatch(setTrack(music)),
  setQueue: (queue) => dispatch(setQueue(queue)),
});

class Search extends Component {
  constructor () {
    super();

    this.onOpenSearchBar = this.onOpenSearchBar.bind(this);
    this.onCloseSearchBar = this.onCloseSearchBar.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.search = this.search.bind(this);

    this.state = {
      loading: false,
      albums: [],
      tracks: []
    };
  }

  onOpenSearchBar () {
    this.searchBar.style.transform = `scale(1)`;
  }

  onCloseSearchBar () {
    this.searchBar.style.transform = 'scale(0.97)';
  }

  onInputChange (evt) {
    const term = evt.target.value;
    if (term === '') return;
    // avoid doing too much api calls
    const search = debounce(_ => this.search(term), 150);
    search();
  }

  search (term) {
    // show a spinner if loading is too long
    //const timeout = setTimeout(_ => this.setState({loading: true}), 500);

    fetch(`${Constants.API_URL}/search/${term}`, {
      headers: {
        'authorization': `Bearer ${localStorage.getItem('streamwave-token')}`
      }
    }).then(response => response.json())
      .then(({results: {albums, tracks}}) => {
        return this.setState({albums, tracks});
      })
      .then(_ => {
        if (this.state.albums.length > 0 || this.state.tracks.length > 0) {
          //clearTimeout(timeout);
          this.setState({
            loading: false
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  listen (track) {
    const {tracks} = this.state;
    const {artist, album, coverURL, manifestURL, playlistHLSURL} = track;

    const index = tracks.findIndex(t => t.title === track.title);
    this.props.setQueue(tracks);

    this.props.setTrack({
      artist,
      album,
      coverURL,
      track,
      index: 0
    });

    this.props.listen(manifestURL, playlistHLSURL, {artist, album, title: track.title, coverURL}, true);
  }

  renderResults (albums, tracks) {
    return (
      <div>
        {albums.length > 0 && <div class="search__albums-header">Albums</div>}
        {this.renderAlbums(albums)}
        {tracks.length > 0 && <div class="search__tracks-header">Pistes</div>}
        {this.renderTracks(tracks)}
      </div>
    )
  }

  renderAlbums (albums) {
    return (
      albums.map(album => (
        <Link class="search__albums-results" key={album._id} to={`/album/${album._id}`}>
          <img class="search__album-cover" src={`${Constants.CDN_URL}/${album.coverURL}`} alt="album cover" />
          <div class="search__album-infos">
            <div class="search__album-artist">{album.artist}</div>
            <div class="search__album-title">{album.title}</div>
          </div>
        </Link>
      ))
    );
  }

  renderTracks (tracks) {
    // TODO: remove arrow function for binded stuff
    return (
      tracks.map(track => (
        <button class="search__track-results" onClick={() => this.listen(track)}>
          <div class="search__track-infos">
            <div class="search__track__title">{track.title}</div>
            <div class="search__track-inline">
              <div class="search__track-artist">{track.artist}</div>•<div class="search__track-album">{track.album}</div>
            </div>
          </div>
          <div class="track__duration">
            {formatDuration(track.duration)}
          </div>
        </button>
      ))
    )
  }

  render ({}, {loading, albums, tracks}) {
    return (
      <div class="search">
        <div class="search__search-bar-container">
          <input
            type="text"
            placeholder="Rechercher"
            class="search__search-bar"
            ref={searchBar => this.searchBar = searchBar}
            onInput={this.onInputChange}
            onClick={this.onOpenSearchBar}
            onBlur={this.onCloseSearchBar}
          />
        </div>
        <div class="search__results">
          {
            loading ?
            <div class="search__center">
              <div class="loader"/>
            </div>
            :
            this.renderResults(albums, tracks)
          }
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Search);
