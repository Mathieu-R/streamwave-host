import Constants from '../constants';
import '../../third_party/gapi';

class Auth {
  constructor () {
    const googleButton = document.querySelector('.auth-home__google-button');
    if (!googleButton) {
      return;
    }

    this.googleButton = googleButton;

    this.GOOGLE_CLIENT_ID = '518872171102-tpqle4q49rihv2atopm4c0uvnumochtd.apps.googleusercontent.com';
    this.autoSignOnConnect = this.autoSignOnConnect.bind(this);
    this.googleLogin = this.googleLogin.bind(this);

    this.initGapi();
    this.addEventListeners();
  }

  initGapi () {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: this.GOOGLE_CLIENT_ID
      }).then(() => {
        console.log('[OAUTH2] gapi init.');
        this.autoSignOnConnect().catch(err => console.error(err));
      });
    });
  }

  addEventListeners () {
    this.googleButton.addEventListener('click', this.googleLogin);
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

      if (!credentials) return;
      if (credentials.type === 'password') {
        const response = await fetch(`/auth/local/login`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            email: credentials.id,
            password: credentials.password
          })
        });
        return;
      }

      if (credentials.type === 'federated') {
        console.log(this);
        this.googleLogin();
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
      return fetch(`/auth/google/login`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
    })
    .then(response => response.json())
    .then(({user}) => {
      this.storeFederatedCredentials(user).then(_ => {
        location.href = '/';
      });
    })
    .catch(err => console.error(err));
  }

  async storeFederatedCredentials (profile) {
    if (Constants.SUPPORT_CREDENTIAL_MANAGEMENT_API) {
      console.log(profile);
      const credentials = await navigator.credentials.create({
        federated: {
          id: profile.id,
          provider: 'https://accounts.google.com',
          name: profile.username,
          iconURL: profile.avatar
        }
      });
      return navigator.credentials.store(credentials);
    }
  }
}

export default Auth;
