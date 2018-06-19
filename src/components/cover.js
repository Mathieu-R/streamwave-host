import { h, Component } from 'preact';
import { Link } from 'react-router-dom';
import { getRGBCssFromObject } from '../utils';
import Constants from '../constants';

class Cover extends Component {
  render ({artist, title, coverURL, id, primaryColor}) {
    const placeholderRGB = getRGBCssFromObject(primaryColor);
    return (
      <div class="cover">
        <Link to={`/album/${id}`} class="cover__link">
          {/* cover__artwork class is useful for lazy-loading */}
          <section class="cover__artwork-container" style={{background: placeholderRGB}}>
            <img data-src={`${Constants.CDN_URL}/${coverURL}`} alt="cover artwork" class="cover__artwork lazy" />
          </section>
          <section class="cover__infos-container">
            <div class="cover__title">{title}</div>
            <div class="cover__artist">{artist}</div>
          </section>
        </Link>
      </div>
    );
  }
}

export default Cover;
