import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middlewares = composeEnhancers(
  applyMiddleware(thunk)
);

const initialState = {
  toast: {
    show: false,
    messages: [],
    buttons: []
  },
  sideNav: {
    show: false
  },
  player: {
    // show fullscreen player
    show: false,
    // current track
    track: null,
    // queue (shuffle or not)
    // needed to handle continuous play
    queue: [],
    // current time of the track
    currentTime: null,
    // is the track playing
    playing: false,
    repeat: false,
    shuffle: false,
    // assume a presentation display
    // is available by default
    chromecastAvailable: true,
    chromecasting: false,
    // list of current downloads and their percentages
    downloads: {}
  },
  playlists: [],
  settings: {
    fade: 0,
    downloadQuality: 256,
    limitData: false,
    dataMax: 0
  }
};

const store = createStore(
  reducers,
  initialState,
  middlewares
);

export default store;
