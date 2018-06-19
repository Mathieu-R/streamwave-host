import { h, Component } from 'preact';
import Switch from '../switch';
import Range from '../range';
import Circle from '../circle';

class DataVolume extends Component {
  shouldComponentUpdate (nextProps) {
    if (this.props.limitData !== nextProps.limitData) {
      return true;
    }

    if (this.props.dataMax !== nextProps.dataMax) {
      return true;
    }

    if (this.props.volume !== nextProps.volume) {
      return true;
    }

    return false;
  }

  render ({limitData, dataMax, volume, onLimitDataStatusChange, onMaxDataVolumeChange, resetDataVolume}) {
    return (
      <div class="data-volume">
        <Switch
          label="Volume de données maximale (mo)"
          onChange={onLimitDataStatusChange}
          value={limitData}
        />
        <div class={
          limitData ?
          'data-volume__range data-volume__range--visible' :
          'data-volume__range'
        } show={limitData}>
          <span class="data-volume__bound">200mo</span>
          <Range
            min={200}
            max={2000}
            value={dataMax}
            showTooltip={true}
            onChange={onMaxDataVolumeChange}
          />
          <span class="data-volume__bound">2000mo</span>
        </div>
        {/* SVG arc with data consumed until today */}
        {
          limitData &&
          <Circle volume={volume} dataMax={dataMax} resetDataVolume={resetDataVolume} />
        }
      </div>
    );
  }
}

export default DataVolume;
