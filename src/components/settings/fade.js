import { h, Component } from 'preact';
import Range from '../range';

class Fade extends Component {
  shouldComponentUpdate (nextProps) {
    return this.props.fade !== nextProps.fade;
  }

  render ({fade, onChange}) {
    return (
      <div class="fade">
        <label class="fade__label" for="fade">Fondu enchainé</label>
        <div class="fade__bar">
          <span class="fade__range-bound">off</span>
            <Range
              min={0}
              max={12}
              onChange={onChange}
              value={fade}
            />
          <span class="fade__range-bound">12s</span>
        </div>
      </div>
    );
  }
}

export default Fade;
