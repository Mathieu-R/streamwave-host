import Toast from '../components/toast';

class Register {
  constructor () {
    const form = document.querySelector('.register-form');
    if (!form) {
      return;
    }

    this.form = form;
    this.register = this.register.bind(this);
    this.form.addEventListener('submit', this.register);
  }

  register (evt) {
    evt.preventDefault();

    const form = evt.target;
    const email = form.email.value;
    const password = form.password.value;
    const passwordConfirm = form.passwordConfirm.value;

    if (email === '' || password === '' || passwordConfirm === '') {
      Toast.create(['Vérifiez que vous avez bien rempli tous les éléments du formulaire.']);
      return;
    }

    if (password !== passwordConfirm) {
      Toast.create(['Les mots de passes ne sont pas équivalents.']);
      return;
    }

    this.performRegister(email, password)
      .catch(err => console.error(err));
  }

  async performRegister (email, password) {
    const response = await fetch(`/auth/local/register`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email, password
      })
    });

    if (response.status === 204) {
      Toast.create(['Cet utilisateur existe déjà...']);
      return;
    }

    // server error
    if (response.status === 500) {
      Toast.create(['Erreur lors de la création du compte.']);
      return;
    }

    const data = await response.json();

    // bad typing, password not strong enough
    if (response.status === 400) {
      const errors = Object.keys(data.error).map(err => data.error[err].msg);
      Toast.create(errors, ['dismiss'], 8000);
      return;
    }

    // email already used
    if (response.status === 409) {
      Toast.create([data.error], ['dismiss'], 8000);
      return;
    }

    // user not created
    // likely because mail sending failed
    if (response.status === 422) {
      Toast.create([data.error], ['dismiss'], 8000);
      return;
    }

    // user created, mail sent
    Toast.create(data.message);
  }
}

export default Register;
