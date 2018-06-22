import AuthController from './auth/auth-controller';
import LoginController from './auth/login-controller';
import RegisterController from './auth/register-controller';
import ForgotController from './auth/forgot-controller';
import ResetController from './auth/reset-controller';

class Streamwave {
  constructor () {
    new AuthController();
    new LoginController();
    new RegisterController();
    new ForgotController();
    new ResetController();
  }
}

window.addEventListener('load', _ => new Streamwave());
