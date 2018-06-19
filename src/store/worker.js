// OLD STORE WORKING WITH STOCKROOM
// STOCKROOM IS TOO YOUNG TO BE USED IN PRODUCTION
// THAT'S ONLY MY OPINION BTW

import createStore from 'stockroom/worker';
import Constants from '../constants';

const store = createStore({
  user: {
    userId: '',
    email: '',
    avatar: ''
  },
  library: [],
  toast: {
    messages: [],
    show: false
  }
});

// globally available actions
store.registerActions(store => ({
  toasting (state, messages, duration = 3000) {
    store.setState({
      toast: {
        messages,
        show: true
      }
    });
    setTimeout(() => store.setState({toast: {show: false}}, duration));
  },

  storeUser (state, user) {
    return {
      user
    }
  },

  storeLibrary (state, library) {
    return {
      library
    }
  }
}));
