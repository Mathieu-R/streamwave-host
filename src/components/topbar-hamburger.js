import { h, Component } from 'preact';
import { connect } from 'react-redux';

import hamburger from '../assets/svg/hamburger.svg';

import {
  showSideNav
} from '../store/side-nav';

const mapDispatchToProps = dispatch => ({
  showSideNav: _ => dispatch(showSideNav())
});

class TopBarHamburger extends Component {
  constructor () {
    super();
    this.showSideNav = this.showSideNav.bind(this);
  }

  shouldComponentUpdate (nextProps) {
    return false;
  }

  showSideNav () {
    this.props.showSideNav();
  }

  render ({showSideNav}) {
    return (
      <div class="top-bar">
        <img class="top-bar__button" role="button" src={hamburger} onClick={this.showSideNav} alt="hamburger open menu" />
        <div class="top-bar__title">
          Streamwave
        </div>
        <div class="top-bar__cast-receiver">
          <p class="top-bar__cast-receiver__description">Ecoute en cours sur</p>
          <p class="top-bar__cast-receiver__name"></p>
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(TopBarHamburger);
