import { h, Component } from 'preact';
import { connect } from 'react-redux';
import Constants from '../../constants';

import {
  toasting
} from '../../store/toast';

const mapDispatchToProps = dispatch => ({
  toasting: (messages, buttons, duration) => dispatch(toasting(messages, buttons, duration))
});

class Reset extends Component {
  constructor () {
    super();
    this.reset = this.reset.bind(this);
  }

  reset (evt) {
    evt.preventDefault();

    const token = this.props.match.params.token;
    const password = this.password.value;
    const passwordConfirm = this.passwordConfirm.value;

    if (password === '' || passwordConfirm === '') {
      this.props.toasting(['Vérifiez que vous avez bien rempli tous les éléments du formulaire.']);
      return;
    }

    if (password !== passwordConfirm) {
      this.props.toasting(['Les mots de passes ne sont pas équivalents.']);
      return;
    }

    this.performReset(password, token)
      .catch(err => console.error(err));
  }

  async performReset (password, token) {
    const response = await fetch(`${Constants.AUTH_URL}/local/account/reset/change-password?token=${token}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        password
      })
    });

    // server error
    if (response.status === 500) {
      this.props.toasting(['Erreur lors du changement de mot de passe.']);
      return;
    }

    const data = await response.json();

    // token invalid or expired
    if (response.status === 400) {
      this.props.toasting([data.error]);
      return;
    }

    // password changed
    this.props.toasting([data.message]);
    this.props.history.push('/auth');
  }

  render () {
    return (
      <div class="container">
        <form class="form" onSubmit={this.reset}>
          <div class="input-wrapper">
            <label class="label" for="password">Nouveau mot de passe</label>
            <input ref={input => this.password = input} type="password" id="password" autocomplete="new-password"/>
          </div>
          <div class="input-wrapper">
            <label class="label" for="password-confirm">Confirmation du nouveau mot de passe</label>
            <input ref={input => this.passwordConfirm = input} type="password" id="password-confirm" autocomplete="new-password"/>
          </div>
          <button class="form-button" type="submit" aria-label="change password">
            Changer de mot de passe
          </button>
        </form>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Reset);
