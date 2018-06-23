class SideNav {
  constructor () {
    const sideNav = document.querySelector('.side-nav');
    if (!sideNav) {
      return;
    }

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

    this.sideNav = sideNav;
    this.overlay = document.querySelector('.overlay');
    this.closeButton = document.querySelector('.side-nav__hamburger');

    this.addEventListeners();
  }

  addEventListeners () {
    document.addEventListener('touchstart', this.onTouchStart);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);

    this.overlay.addEventListener('click', this.hideSideNav);
    this.sideNav.addEventListener('click', this.blockClick);
    this.closeButton.addEventListener('click', this.close);
  }

  removeEventListeners () {
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
      this.hideSideNav();
    }
  }

  close (evt) {
    //evt.stopPropagation();
    this.hideSideNav();
  }
}

export default SideNav;
