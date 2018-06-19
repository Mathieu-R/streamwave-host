import { combineReducers } from 'redux';

import toast from './toast';
import user from './user';
import sideNav from './side-nav';
import library from './library';
import player from './player';
import playlists from './playlists';
import settings from './settings';

// the name of reducers here
// define the name of the properties
// in the store
export default combineReducers({
  toast,
  user,
  sideNav,
  library,
  player,
  playlists,
  settings
});
