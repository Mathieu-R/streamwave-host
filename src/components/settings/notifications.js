import { h, Component } from 'preact';
import Switch from '../switch';

class Notifications extends Component {
  shouldComponentUpdate (nextProps) {
    return this.props.value !== nextProps.value;
  }

  render ({value, onChange}) {
    return (
      <div class="notifications">
        <Switch
          label="Autoriser les notifications"
          onChange={onChange}
          value={value}
        />
        <p class="notifications__description">
          exemple: être informé de l'ajout d'un album dans le catalogue
        </p>
      </div>
    );
  }
}

export default Notifications;
