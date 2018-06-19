import { h, Component } from 'preact';
import Switch from '../switch';

class DownloadWithMobileNetwork extends Component {
  shouldComponentUpdate (nextProps) {
    return this.props.value !== nextProps.value;
  }

  render ({value, onChange}) {
    return (
      <div class="download-mobile-network">
        <Switch
          label="Télécharger à l'aide du réseau mobile"
          onChange={onChange}
          value={value}
        />
      </div>
    );
  }
}

export default DownloadWithMobileNetwork;
