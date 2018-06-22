import Toast from '../components/toast';

class Forgot {
  constructor () {
    const form = document.querySelector('.forgot-form');
    if (!form) {
      return;
    }

    this.form = form;
    this.sendPasswordChangeEmail = this.sendPasswordChangeEmail.bind(this);

    this.form.addEventListener('submit', this.sendPasswordChangeEmail);
  }

  sendPasswordChangeEmail (evt) {
    evt.preventDefault();

    const form = evt.target;
    const email = form.email.value;

    if (email === '') {
      Toast.create(['E-mail vide.']);
      return;
    }

    this.getChangePasswordEmail(email)
      .catch(err => console.error(err));
  }

  async getChangePasswordEmail (email) {
    const response = await fetch(`/auth/local/account/reset/get-reset-token`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    });

    // email does not exist
    if (response.status === 204) {
      Toast.create([`Cet e-mail n'existe pas.`]);
      return;
    }

    // reset account failed
    if (response.status === 500) {
      Toast.create(['Erreur lors de la demande de changement de mot de passe.']);
      return;
    }

    // email sent, check it to change your password
    const data = await response.json();
    Toast.create([data.message]);
  }
}

export default Forgot;
