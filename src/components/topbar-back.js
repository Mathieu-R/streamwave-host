import { h, Component } from 'preact';
import { Link } from 'react-router-dom';

import arrow from '../assets/svg/arrow.svg';

class TopBarBack extends Component {
  shouldComponentUpdate () {
    return false;
  }

  render ({url}) {
    return (
      <div class="top-bar">
        <Link to={url}>
          <img class="top-bar__button" role="button" src={arrow} alt="arrow back to home" />
        </Link>
        <div class="top-bar__title">
          Streamwave
        </div>
      </div>
    )
  }
}

export default TopBarBack;
