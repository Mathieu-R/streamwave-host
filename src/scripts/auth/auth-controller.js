import Constants from '../constants';

class Auth {
  constructor () {
    const googleButton = document.querySelector('.auth-home__google-button');
    if (!googleButton) {
      return;
    }

    this.googleButton = googleButton;
    this.autoSignOnConnect = this.autoSignOnConnect.bind(this);
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
        return;
      }
    }
  }
}

export default Auth;
