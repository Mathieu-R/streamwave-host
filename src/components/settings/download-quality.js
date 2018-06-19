import { h, Component } from 'preact';
import Select from 'material-ui/Select';

class DownloadQuality extends Component {
  shouldComponentUpdate (nextProps) {
    return this.props.quality !== nextProps.quality;
  }

  render ({quality, onChange}) {
    return (
      <div class="download-quality">
        <label for="quality">Qualité de téléchargement</label>
        <Select native onChange={onChange} value={quality} style={{color: '#FFF'}}>
          <option value="128">128k</option>
          <option value="192">192k</option>
          <option value="256">256k</option>
        </Select>
      </div>
    );
  }
}

export default DownloadQuality;
