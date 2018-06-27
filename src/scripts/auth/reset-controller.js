import Toast from '../components/toast';

class Reset {
  constructor () {
    const form = document.querySelector('.reset-form');
    if (!form) {
      return;
    }

    this.form = form;
    this.reset = this.reset.bind(this);

    this.form.addEventListener('submit', this.reset);
  }

  reset (evt) {
    evt.preventDefault();

    const params = (new URL(document.location)).searchParams;
    const token = params.get('token');
    const form = evt.target
    const password = form.password.value;
    const passwordConfirm = form['password-confirm'].value;

    if (password === '' || passwordConfirm === '') {
      Toast.create(['Vérifiez que vous avez bien rempli tous les éléments du formulaire.']);
      return;
    }

    if (password !== passwordConfirm) {
      Toast.create(['Les mots de passes ne sont pas équivalents.']);
      return;
    }

    this.performReset(password, token)
      .catch(err => console.error(err));
  }

  async performReset (password, token) {
    const response = await fetch(`/auth/local/account/reset/change-password?token=${token}`, {
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
      Toast.create(['Erreur lors du changement de mot de passe.']);
      return;
    }

    const data = await response.json();

    // token invalid or expired
    if (response.status === 400) {
      Toast.create([data.error]);
      return;
    }

    // password changed
    Toast.create([data.message]);
    location.href = '/auth';
  }
}

export default Reset;
