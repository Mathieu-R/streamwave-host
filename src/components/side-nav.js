import { h, Component } from 'preact';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
  getUser
} from '../store/user';

import {
  getShowSideNav,
  hideSideNav
} from '../store/side-nav';

const mapStateToProps = state => ({
  showSideNav: getShowSideNav(state),
  user: getUser(state)
});

const mapDispatchToProps = dispatch => ({
  hideSideNav: _ => dispatch(hideSideNav())
});

class SideNav extends Component {
  constructor () {
    super();
    this.startX = 0;
    this.currentX = 0;
    this.dragging = false;

    this.showSideNav = this.showSideNav.bind(this);
    this.hideSideNav = this.hideSideNav.bind(this);
    this.blockClick = this.blockClick.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.close = this.close.bind(this);
  }

  shouldComponentUpdate (nextProps) {
    if (nextProps.user !== this.props.user) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps (props) {
    if (props.showSideNav) {
      this.showSideNav();
      return;
    }

    this.hideSideNav();
  }

  componentDidMount () {
    document.addEventListener('touchstart', this.onTouchStart);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
  }

  componentWillUnmount () {
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  }

  onTransitionEnd () {
    this.container.classList.remove('side-nav--animatable');
    this.container.removeEventListener('transitionend', this.onTransitionEnd);
  }

  showSideNav () {
    this.overlay.classList.add('overlay--visible');
    this.container.classList.add('side-nav--animatable');
    this.container.classList.add('side-nav--visible');
    this.container.addEventListener('transitionend', this.onTransitionEnd);
  }

  hideSideNav () {
    this.overlay.classList.remove('overlay--visible');
    this.container.classList.add('side-nav--animatable');
    this.container.classList.remove('side-nav--visible');
    this.container.addEventListener('transitionend', this.onTransitionEnd);
  }

  blockClick (evt) {
    evt.stopPropagation();
  }

  onTouchStart (evt) {
    if (!(this.container.classList.contains('side-nav--visible'))) {
      return;
    }

    this.dragging = true;
    this.startX = evt.touches[0].pageX;
    this.currentX = this.startX;
  }

  onTouchMove (evt) {
    if (!this.dragging) {
      return;
    }

    this.currentX = evt.touches[0].pageX;
    this.translateX = Math.min(0, this.currentX - this.startX);
    this.container.style.transform = `translateX(${this.translateX}px)`;
  }

  onTouchEnd () {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.container.style.transform = '';

    if (this.translateX < 0) {
      this.props.hideSideNav();
    }
  }

  close (evt) {
    //evt.stopPropagation();
    this.props.hideSideNav();
  }

  render ({hideSideNav, user}) {
    return (
      <div class="overlay"
        ref={overlay => this.overlay = overlay}
        onClick={hideSideNav}
      >
        <aside class="side-nav"
          ref={container => this.container = container}
          onClick={this.blockClick}
        >
          <div class="side-nav__hamburger-container">
            <button class="side-nav__hamburger" onClick={this.close} aria-label="hide sidenav"></button>
          </div>
          <div class="side-nav__user">
            <img class="side-nav__avatar" src={user.avatar} alt="avatar" />
            <div class="side-nav__infos">
              <p class="side-nav__username">{user.username}</p>
              <p class="side-nav__mail">{user.email ? user.email : ''}</p>
            </div>
          </div>
          <ul class="side-nav__menu">
            <li class="side-nav__element"><Link class="side-nav__link" to="/" onClick={hideSideNav} aria-label="home">Home</Link></li>
            <li class="side-nav__element"><Link class="side-nav__link" to="/about" onClick={hideSideNav} aria-label="about">A propos</Link></li>
            <li class="side-nav__element"><Link class="side-nav__link" to="/licences" onClick={hideSideNav} aria-label="licences">Licenses musicales</Link></li>
            <li class="side-nav__element"><Link class="side-nav__link" to="/upload" onClick={hideSideNav} aria-label="upload music albums">Importer ma musique</Link></li>
            <li class="side-nav__element"><Link class="side-nav__link" to="/demo" onClick={hideSideNav} aria-label="demo streaming">Demo</Link></li>
          </ul>
        </aside>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SideNav);
