import { h, Component } from 'preact';

class Switch extends Component {
  shouldComponentUpdate (nextProps) {
    if (nextProps.value !== this.props.value) {
      return true;
    }
    return false;
  }

  render ({label, value, onChange}) {
    return (
      <div class="switch">
        <input class="switch__input" type="checkbox" id={label} onChange={onChange} checked={value}/>
        <label class="switch__label" for={label}>{label}</label>
      </div>
    );
  }
}

export default Switch;

