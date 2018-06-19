import { h, Component } from 'preact';
import { connect } from 'react-redux';
import TopBarBack from '../../components/topbar-back';
import Constants from '../../constants';

import {
  toasting
} from '../../store/toast';

const mapDispatchToProps = dispatch => ({
  toasting: (messages, buttons, duration) => dispatch(toasting(messages, buttons, duration))
});

class Login extends Component {
  constructor () {
    super();
    this.login = this.login.bind(this);
  }

  login (evt) {
    evt.preventDefault();

    const email = this.email.value;
    const password = this.password.value;

    if (email === '' || password === '') {
      this.props.toasting(['email ou/et mot de passe manquant.']);
      return;
    }

    this.connectAndStoreToken(email, password)
      .catch(err => console.error(err));
  }

  async connectAndStoreToken (email, password) {
    const response = await fetch(`${Constants.AUTH_URL}/local/login`, {
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
      this.props.toasting([`Cet utilisateur n'existe pas.`]);
      return;
    }

    const data = await response.json();

    // bad typing
    if (response.status === 400) {
      const errors = data.error.map(err => err.msg);
      this.props.toasting(errors);
      return;
    }

    // server error
    if (response.status === 500) {
      this.props.toasting([data.error]);
      return;
    }

    localStorage.setItem('streamwave-token', data.token);
    const credentials = await this.storeCredentials(email, password);
    this.props.history.push('/');
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

  render () {
    return (
      <div class="container-column">
        <TopBarBack url='/auth' />
        <form class="form" onSubmit={this.login}>
          <div class="input-wrapper">
            <label class="label" for="email">E-mail</label>
            <input ref={input => this.email = input} type="email" id="email" autocomplete="email"/>
          </div>
          <div class="input-wrapper">
            <label class="label" for="password">Mot de passe</label>
            <input ref={input => this.password = input} type="password" id="password" autocomplete="current-password"/>
          </div>
          <button class="form-button" aria-label="login">
            Se connecter
          </button>
        </form>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Login);
