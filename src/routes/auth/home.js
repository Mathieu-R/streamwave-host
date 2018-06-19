import { h, Component } from 'preact';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import decode from 'jwt-decode';
import Constants from '../../constants';

import '../../third_party/gapi';

import {
  storeUser
} from '../../store/user';

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  storeUser: user => dispatch(storeUser(user))
});

class Auth extends Component {
  constructor () {
    super();

    this.GOOGLE_CLIENT_ID = '518872171102-tpqle4q49rihv2atopm4c0uvnumochtd.apps.googleusercontent.com';
    this.googleLogin = this.googleLogin.bind(this);
  }

  componentDidMount () {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: this.GOOGLE_CLIENT_ID
      }).then(() => {
        console.log('[OAUTH2] gapi init.');
        this.autoSignOnConnect()
          .catch(err => console.error(err));
      });
    });
  }

  async autoSignOnConnect () {
    if (Constants.SUPPORT_CREDENTIAL_MANAGEMENT_API) {
      const credentials = await navigator.credentials.get({
        password: true,
        federated: {
          providers: ['https://accounts.google.com']
        },
        // shows an account chooser
        // if preventSilentAccess called previously
        mediation: 'optional'
      });

      console.log('Credentials:', credentials);

      if (!credentials) return;
      if (credentials.type === 'password') {
        const response = await fetch(`${Constants.AUTH_URL}/local/login`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            email: credentials.id,
            password: credentials.password
          })
        });

        // TODO: maybe fix ?
        const data = await response.json();
        localStorage.setItem('streamwave-token', data.token);
        this.props.history.push('/');
        return;
      }

      if (credentials.type === 'federated') {
        this.googleLogin().catch(err => console.error(err));
        return;
      }
    }
  }

  googleLogin (evt) {
    let gid = '';
    const auth = gapi.auth2.getAuthInstance();
    auth.signIn({
      login_hint: gid || ''
    }).then(profile => {
      const token = profile.getAuthResponse().id_token;
      return fetch(`${Constants.AUTH_URL}/google/login`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
    })
    .then(response => response.json())
    .then(({token}) => {
      localStorage.setItem('streamwave-token', token);
      return decode(token);
    })
    .then(user => {
      this.props.storeUser(user);
      this.storeFederatedCredentials(user).then(_ => {
        this.props.history.push('/');
      });
    })
    .catch(err => console.error(err));
  }

  async storeFederatedCredentials (profile) {
    if (Constants.SUPPORT_CREDENTIAL_MANAGEMENT_API) {
      const credentials = await navigator.credentials.create({
        federated: {
          id: profile.id,
          provider: 'https://accounts.google.com',
          name: profile.username,
          iconURL: profile.avatar
        }
      });
      console.log('credentials to save: ', credentials);
      return navigator.credentials.store(credentials);
    }
  }

  render () {
    return (
      <div class="container">
        <div class="wrapper">
          <section class="auth-home__welcome">
            <h1 class="auth-home__title">Streamwave</h1>
            <span class="auth-home__subtitle">streaming music pwa</span>
          </section>
          <section class="auth-home__buttons">
            <button class="auth-home__login-button" aria-label="go to login page">
              <Link class="link-button auth-home__auth-link" to="/auth/login">
                Se connecter
              </Link>
            </button>
            <button class="auth-home__register-button" aria-label="go to register page">
              <Link class="link-button auth-home__auth-link" to="/auth/register">
                Créer un compte
              </Link>
            </button>
            <button class="auth-home__google-button" onClick={this.googleLogin} aria-label="login with your google account">
              Continuer avec google
            </button>
            <Link class="link-button auth-home__password-reset-link" to="/auth/forgot" aria-label="go to password reset page">
              Mot de passe oublié ?
            </Link>
          </section>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
