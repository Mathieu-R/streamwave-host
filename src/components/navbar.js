import { h, Component } from 'preact';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import {
  switchPlayerStatus, getTrack
} from '../store/player';

const mapStateToProps = state => ({
  track: getTrack(state)
})

const mapDispatchToProps = dispatch => ({
  switchPlayerStatus: payload => dispatch(switchPlayerStatus(payload))
});

class Navbar extends Component {
  constructor () {
    super();
    this.showPlayer = this.showPlayer.bind(this);
  }

  // trying to prevent unnecessary updates
  shouldComponentUpdate () {
    return false;
  }

  showPlayer (evt) {
    // no track playing (pause or play)
    if (!this.props.track) {
      return;
    }

    this.props.switchPlayerStatus({show: true});
  }

  render () {
    return (
      <div class="navbar">
        <NavLink class="navbar__link" to="/">
          <button class="navbar__button" aria-label="library">
            <div class="navbar__icon">
              <svg viewBox="0 0 33 36" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs></defs>
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="Icons-Pattern-One" transform="translate(-711.000000, -465.000000)" fill="#FFF">
                    <g id="Library" transform="translate(709.000000, 465.000000)">
                      <path d="M4.43517938,0 L4.43517938,0 C5.78009181,-2.47056406e-16 6.87035876,1.09026694 6.87035876,2.43517938 L6.87035876,33.5648206 L6.87035876,33.5648206 C6.87035876,34.9097331 5.78009181,36 4.43517938,36 L4.43517938,36 L4.43517938,36 C3.09026694,36 2,34.9097331 2,33.5648206 L2,2.43517938 L2,2.43517938 C2,1.09026694 3.09026694,2.47056406e-16 4.43517938,0 L4.43517938,0 Z M23.3331457,0.613335127 C24.6727509,0.262477953 26.0496988,1.03954406 26.4086449,2.34896086 L34.6410846,32.3804729 C35.0000308,33.6898897 34.2050495,35.0358077 32.8654444,35.3866649 C31.5258392,35.737522 30.1488913,34.9604559 29.7899452,33.6510391 L21.5575054,3.61952708 C21.1985593,2.31011028 21.9935405,0.964192301 23.3331457,0.613335127 Z M14.1371647,0 L14.1371647,0 C15.4820772,-2.47056406e-16 16.5723441,1.09026694 16.5723441,2.43517938 L16.5723441,33.5648206 L16.5723441,33.5648206 C16.5723441,34.9097331 15.4820772,36 14.1371647,36 C12.7922523,36 11.7019854,34.9097331 11.7019854,33.5648206 L11.7019854,2.43517938 L11.7019854,2.43517938 C11.7019854,1.09026694 12.7922523,2.47056406e-16 14.1371647,0 L14.1371647,0 Z"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div class="navbar__icon-title">
              Bibliothèque
            </div>
          </button>
        </NavLink>
        <NavLink class="navbar__link" to="/playlist">
          <button class="navbar__button" aria-label="playlists">
            <div class="navbar__icon">
              <svg viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>Queue</title>
                <desc>Created with Sketch.</desc>
                <defs></defs>
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="Icons-Pattern-One" transform="translate(-860.000000, -465.000000)" fill="#FFF">
                    <g id="Queue" transform="translate(860.000000, 465.000000)">
                      <path d="M18.1946151,7.57330547 L33.8762935,7.57330547 C34.980863,7.57330547
                      35.8762935,8.46873597 35.8762935,9.57330547 C35.8762935,10.677875 34.980863,11.5733055
                      33.8762935,11.5733055 L16.2281832,11.5733055 L18.2729987,10.380719 C18.511274,10.241751
                      18.7095348,10.0434902 18.8485028,9.80521486 C19.2932826,9.04259295 19.0356206,8.06380048
                      18.2729987,7.61902071 L18.1946151,7.57330547 Z M3.87629351,33.5733055 C3.87629351,32.468736
                      4.77172401,31.5733055 5.87629351,31.5733055 L33.8762935,31.5733055 C34.980863,31.5733055
                      35.8762935,32.468736 35.8762935,33.5733055 C35.8762935,34.677875 34.980863,35.5733055
                      33.8762935,35.5733055 L5.87629351,35.5733055 C4.77172401,35.5733055 3.87629351,34.677875
                      3.87629351,33.5733055 Z M3.87629351,21.5733055 C3.87629351,20.468736 4.77172401,19.5733055
                      5.87629351,19.5733055 L33.8762935,19.5733055 C34.980863,19.5733055 35.8762935,20.468736
                      35.8762935,21.5733055 C35.8762935,22.677875 34.980863,23.5733055 33.8762935,23.5733055
                      L5.87629351,23.5733055 C4.77172401,23.5733055 3.87629351,22.677875 3.87629351,21.5733055
                      Z M15.1941076,9.9718314 L1.69199485,17.8465942 C1.15521659,18.1596565 0.466284754,17.9782988
                      0.153222525,17.4415205 C0.0528748417,17.2694638 0,17.0738525 0,16.8746712 L0,1.12514554
                      C0,0.503744818 0.503744818,0 1.12514554,0 C1.32432678,0 1.51993815,0.0528748417
                      1.69199485,0.153222525 L15.1941076,8.02798536 C15.7308858,8.34104759 15.9122435,9.02997943
                      15.5991813,9.56675769 C15.5013674,9.73446991 15.3618198,9.87401752 15.1941076,9.9718314 Z">
                      </path>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div class="navbar__icon-title">
              Playlists
            </div>
          </button>
        </NavLink>
        <button class="navbar__button" onClick={this.showPlayer} aria-label="currently playing music">
          <div class="navbar__icon">
            <svg xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feather feather-music"
            >
              <path d="M9 17H5a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 0
                2-2zm12-2h-4a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z"
              >
              </path>
              <polyline points="9 17 9 5 21 3 21 15">
              </polyline>
            </svg>
          </div>
          <div class="navbar__icon-title">
            En écoute
          </div>
        </button>
        <NavLink class="navbar__link" to="/search">
          <button class="navbar__button" aria-label="search">
            <div class="navbar__icon">
              <svg fill="#FFFFFF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
              </svg>
            </div>
            <div class="navbar__icon-title">
              Rechercher
            </div>
          </button>
        </NavLink>
        <NavLink class="navbar__link" to="/settings">
          <button class="navbar__button" aria-label="settings">
            <div class="navbar__icon">
              <svg fill="#FFFFFF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
            </div>
            <div class="navbar__icon-title">
              Paramètres
            </div>
          </button>
        </NavLink>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
