// types
const TOAST_MESSAGE = 'TOAST_MESSAGE';
const STOP_TOAST = 'STOP_TOAST';

// actions
export function postToastMessage (messages, buttons) {
  return {
    type: TOAST_MESSAGE,
    messages,
    buttons
  }
}

export function stopToastMessage () {
  return {
    type: STOP_TOAST
  }
}

export function toasting (messages, buttons = [], duration = 3000) {
  return (dispatch) => {
    dispatch(postToastMessage(messages, buttons));
    setTimeout(() => dispatch(stopToastMessage()), duration)
  }
}

// selectors
export const getMessages = state => state.toast.messages;
export const getButtons = state => state.toast.buttons;
export const toShow = state => state.toast.show;

// reducers
export default (state = {}, action) => {
  const {type, messages, buttons} = action;
  switch (type) {
    case TOAST_MESSAGE:
      return {
        ...state,
        messages: [...messages],
        buttons: [...buttons],
        show: true
      }
    case STOP_TOAST:
      return {
        ...state,
        //messages: [],
        //buttons: [],
        show: false
      }
    default:
      return state;
  }
}
