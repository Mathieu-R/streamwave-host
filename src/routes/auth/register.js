import { h, Component } from 'preact';
import { connect } from 'react-redux';
import TopBarBack from '../../components/topbar-back';
import Constants from '../../constants';

import { toasting } from '../../store/toast';

const mapDispatchToProps = dispatch => ({
  toasting: (messages, buttons, duration) => dispatch(toasting(messages, buttons, duration))
});

class Register extends Component {
  constructor () {
    super();
    this.register = this.register.bind(this);
  }

  register (evt) {
    evt.preventDefault();

    const email = this.email.value;
    const password = this.password.value;
    const passwordConfirm = this.passwordConfirm.value;

    if (email === '' || password === '' || passwordConfirm === '') {
      this.props.toasting(['Vérifiez que vous avez bien rempli tous les éléments du formulaire.']);
      return;
    }

    if (password !== passwordConfirm) {
      this.props.toasting(['Les mots de passes ne sont pas équivalents.']);
      return;
    }

    this.performRegister(email, password)
      .catch(err => console.error(err));
  }

  async performRegister (email, password) {
    const response = await fetch(`${Constants.AUTH_URL}/local/register`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email, password
      })
    });

    if (response.status === 204) {
      this.props.toasting(['Cet utilisateur existe déjà...']);
      return;
    }

    // server error
    if (response.status === 500) {
      this.props.toasting(['Erreur lors de la création du compte.']);
      return;
    }

    const data = await response.json();

    // bad typing, password not strong enough
    if (response.status === 400) {
      const errors = Object.keys(data.error).map(err => data.error[err].msg);
      this.props.toasting(errors, ['dismiss'], 8000);
      return;
    }

    // email already used
    if (response.status === 409) {
      this.props.toasting([data.error], ['dismiss'], 8000);
      return;
    }

    // user not created
    // likely because mail sending failed
    if (response.status === 422) {
      this.props.toasting([data.error], ['dismiss'], 8000);
      return;
    }

    // user created, mail sent
    this.props.toasting(data.message);
  }

  render () {
    return (
      <div class="container-column">
        <TopBarBack url='/auth' />
        <form class="form" onSubmit={this.register}>
          <div class="input-wrapper">
            <label class="label" for="email">E-mail</label>
            <input ref={input => this.email = input} type="email" id="email" autocomplete="email"/>
          </div>
          <div class="input-wrapper">
            <label class="label" for="password">Mot de passe</label>
            <input ref={input => this.password = input} type="password" id="password" autocomplete="new-password"/>
          </div>
          <div class="input-wrapper">
            <label class="label" for="password-confirm">Confirmation du mot de passe</label>
            <input ref={input => this.passwordConfirm = input} type="password" id="password-confirm" autocomplete="new-password"/>
          </div>
          <button class="form-button" type="submit" aria-label="register">
            Créer un compte
          </button>
        </form>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Register);
