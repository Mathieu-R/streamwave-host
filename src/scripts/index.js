import AuthController from './auth/auth-controller';
import LoginController from './auth/login-controller';
import RegisterController from './auth/register-controller';
import ForgotController from './auth/forgot-controller';
import ResetController from './auth/reset-controller';
import SideNav from './components/side-nav';

import installServiceWorker from './install-service-worker';

class Streamwave {
  constructor () {
    new AuthController();
    new LoginController();
    new RegisterController();
    new ForgotController();
    new ResetController();
    new SideNav();

    installServiceWorker();
  }
}

window.addEventListener('load', _ => new Streamwave());
