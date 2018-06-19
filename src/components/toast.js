import { h, Component } from 'preact';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';

import {
  getMessages,
  getButtons,
  toShow,
  stopToastMessage
 } from '../store/toast';

const mapStateToProps = state => ({
  messages: getMessages(state),
  buttons: getButtons(state),
  show: toShow(state)
});

const mapDispatchToProps = dispatch => ({
  hide: _ => dispatch(stopToastMessage())
});

class Toast extends Component {
  constructor () {
    super();
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.messages !== this.props.messages || nextProps.show !== this.props.show;
  }

  onClick (evt) {
    const action = evt.target.dataset.action.toLowerCase();

    switch (action) {
      case 'dismiss':
        this.props.hide();
        break;
      case 'reload':
        location.reload();
        break;
      default:
        console.error('Action is not supported by the toast.');
    }
  }

  render ({messages, buttons, show}) {
    return (
      <Transition in={show} timeout={300}>
      {state => (
        <div class={`toast ${state}`} state={state}>
          <div class="toast__messages">
            {messages.map((message, index) => (
              <div class="toast__content" key={index}>{message}</div>
            ))}
          </div>
          <div class="toast__buttons">
            {buttons.map((name, index) => (
              <button class="toast__button" key={index} data-action={name} onClick={this.onClick}>{name}</button>
            ))}
          </div>
        </div>
      )}
      </Transition>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toast);
