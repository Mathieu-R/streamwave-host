import AuthController from './auth/auth-controller';
import LoginController from './auth/login-controller';
import RegisterController from './auth/register-controller';
import ForgotController from './auth/forgot-controller';
import ResetController from './auth/reset-controller';
import SideNav from './components/side-nav';

import installServiceWorker from './install-service-worker';
import Constants from './constants';

class Streamwave {
  constructor () {
    new AuthController();
    new LoginController();
    new RegisterController();
    new ForgotController();
    new ResetController();
    new SideNav();

    this.onIntersection = this.onIntersection.bind(this);
    this.observer = null;

    installServiceWorker();
    this.lazyLoadArtworks();
  }

  lazyLoadArtworks () {
    // 1. select all images to lazy-load
    const artworks = Array.from(document.querySelectorAll('.cover__artwork'));

    // 2. detect IO feature
    if (Constants.SUPPORT_INTERSECTION_OBSERVER) {
      const config = {
        rootMargin: '150px 0px',
        treshold: 0.01
      };

      // 3. create a new observer
      this.observer = new IntersectionObserver(this.onIntersection, config);

      // 4. observe
      artworks.forEach(artwork => this.observer.observe(artwork));
    } else {
      artworks.forEach(artwork => this.preloadImage(artwork));
    }
  }

  onIntersection (entries) {
    // Loop all entries
    entries.forEach(entry => {
      // If we are in viewport
      if (entry.isIntersecting) {
        // stop observe and load image
        this.observer.unobserve(entry.target);
        this.preloadImage(entry.target);
      }
    });
  }

  preloadImage (target) {
    const src = target.dataset.src;
    target.src = src;
    target.classList.remove('lazy');
  }
}

window.addEventListener('load', _ => new Streamwave());
