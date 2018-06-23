import Toast from '../components/toast';
import Constants from '../constants';

class Login {
  constructor () {
    const form = document.querySelector('.login-form');
    if (!form) {
      return;
    }

    this.form = form;
    this.login = this.login.bind(this);

    this.form.addEventListener('submit', this.login);
  }

  login (evt) {
    evt.preventDefault();

    const form = evt.target;
    const email = form.email.value;
    const password = form.password.value;

    if (email === '' || password === '') {
      Toast.create(['email ou/et mot de passe manquant.']);
      return;
    }

    this.connectAndStoreToken(email, password)
      .catch(err => console.error(err));
  }

  async connectAndStoreToken (email, password) {
    const response = await fetch(`/auth/local/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email, password
      })
    });

    // user does not exist
    if (response.status === 204) {
      Toast.create([`Cet utilisateur n'existe pas.`]);
      return;
    }

    const data = await response.json();

    // bad typing
    if (response.status === 400) {
      const errors = data.error.map(err => err.msg);
      Toast.create(errors);
      return;
    }

    // server error
    if (response.status === 500) {
      Toast.create([data.error]);
      return;
    }

    const credentials = await this.storeCredentials(email, password);
    location.href = "/";
  }

  async storeCredentials (email, password) {
    if (Constants.SUPPORT_CREDENTIAL_MANAGEMENT_API) {
      const credentials = await navigator.credentials.create({
        password: {
          id: email,
          password
        }
      });
      return navigator.credentials.store(credentials);
    }
  }
}

export default Login;
