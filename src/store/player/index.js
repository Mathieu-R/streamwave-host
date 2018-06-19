import { createSelector } from 'reselect';

// types
const SET_ARTIST = 'SET_ARTIST';
const SET_COVER_URL = 'SET_COVER_URL';
const SET_TRACK = 'SET_TRACK';
const SET_CURRENT_INDEX = 'SET_CURRENT_INDEX';
const SET_PREV_TRACK = 'SET_PREV_TRACK';
const SET_NEXT_TRACK = 'SET_NEXT_TRACK';
const SET_TRACKS = 'SET_TRACKS';
const SET_QUEUE = 'SET_QUEUE';
const SET_PRIMARY_COLOR = 'SET_PRIMARY_COLOR';
const SWITCH_PLAYING_STATUS = 'SWITCH_PLAYING_STATUS';
const SWITCH_PLAYER_STATUS = 'SWITCH_PLAYER_STATUS';
const SWITCH_SHUFFLE_STATUS = 'SWITCH_SHUFFLE_STATUS';
const SWITCH_REPEAT_STATUS = 'SWITCH_REPEAT_STATUS';
const SET_PLAYING_STATUS = 'SET_PLAYING_STATUS';
const SET_CHROMECAST_AVAILABLE = 'SET_CHROMECAST_AVAILABLE';
const SET_CHROMECAST_STATUS = 'SET_CHROMECAST_STATUS';
const SET_CURRENT_TIME = 'SET_CURRENT_TIME';
const SET_DOWNLOAD_PERCENTAGE = 'SET_DOWNLOAD_PERCENTAGE';
const REMOVE_DOWNLOAD_PERCENTAGE = 'REMOVE_DOWNLOAD_PERCENTAGE';

// actions
export function setArtist (artist) {
  return {
    type: SET_ARTIST,
    artist
  }
}

export function setCoverURL (cover) {
  return {
    type: SET_COVER_URL,
    cover
  }
}

export function setTrack ({artist, album, coverURL, track, index}) {
  return {
    type: SET_TRACK,
    artist,
    album,
    coverURL,
    track,
    index
  }
}

export function setCurrentIndex ({index}) {
  return {
    type: SET_CURRENT_INDEX,
    index
  }
}

export function setPrevTrack () {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      const {player: {queue, artist, album, coverURL, currentIndex}} = getState();
      const index = Math.max(0, currentIndex - 1);
      const track = queue[index];

      dispatch({
        type: SET_TRACK,
        index,
        artist,
        album,
        coverURL,
        track
      });

      const {manifestURL, playlistHLSURL, title} = track;
      resolve({
        manifestURL,
        playlistHLSURL,
        trackInfos: {artist, album, title, coverURL}
      });
    });
  }
}

export function setNextTrack ({continuous}) {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      const {player: {queue, artist, album, coverURL, currentIndex, repeat}} = getState();
      const index = ((currentIndex + 1) > (queue.length - 1)) ? 0 : currentIndex + 1;
      const track = queue[index];
      const {title, manifestURL, playlistHLSURL} = track;
      const trackInfos = {artist, album, title, coverURL};
      let play;

      dispatch({
        type: SET_TRACK,
        index,
        artist,
        album,
        coverURL,
        track
      });

      // continuous mode (no user gesture)
      // not repeat mode
      // next track is the first one
      // => stop listening (= only media in pause, nothing more)
      if (continuous && !repeat && index === 0) {
        play = false;
        // TODO: ensure it'ok to only put that here
        dispatch(setCurrentTime(0));
        dispatch(setPlayingStatus({playing: false}));
      } else {
        play = true;
      }

      const resolveObject = {
        manifestURL,
        playlistHLSURL,
        trackInfos,
        play
      }

      resolve(resolveObject);
    });
  }
}

export function setTracks (tracks) {
  return {
    type: SET_TRACKS,
    tracks
  }
}

export function setQueue (queue) {
  return {
    type: SET_QUEUE,
    queue
  }
}

export function setPrimaryColor (primaryColor) {
  return {
    type: SET_PRIMARY_COLOR,
    primaryColor
  }
}

export function switchPlayingStatus () {
  return {
    type: SWITCH_PLAYING_STATUS
  }
}

export function switchPlayerStatus ({show}) {
  return {
    type: SWITCH_PLAYER_STATUS,
    show
  }
}

export function switchRepeatStatus () {
  return {
    type: SWITCH_REPEAT_STATUS
  }
}

export function switchSuffleStatus () {
  return {
    type: SWITCH_SHUFFLE_STATUS
  }
}

export function setPlayingStatus ({playing}) {
  return {
    type: SET_PLAYING_STATUS,
    playing
  }
}

export function setChromecastAvailable ({available}) {
  return {
    type: SET_CHROMECAST_AVAILABLE,
    available
  }
}

export function setChromecastStatus ({chromecasting}) {
  return {
    type: SET_CHROMECAST_STATUS,
    chromecasting
  }
}

export function setCurrentTime (time) {
  return {
    type: SET_CURRENT_TIME,
    time
  }
}

export function setDownloadPercentage ({id, percentage}) {
  return {
    type: SET_DOWNLOAD_PERCENTAGE,
    id,
    percentage
  }
}

export function removeDownloadPercentage ({id}) {
  return {
    type: REMOVE_DOWNLOAD_PERCENTAGE,
    id
  }
}

// selectors
export const getTrack = state => state.player.track;
export const getArtist = state => state.player.artist;
export const getAlbum = state => state.player.album;
export const getTrackId = state => getTrack(state) && getTrack(state)._id;
export const getTrackName = state => getTrack(state) && getTrack(state).title;
export const getCoverURL = state => getTrack(state) && getTrack(state).coverURL;
export const isMusicPlaying = state => state.player.playing;
export const isChromecastAvailable = state => state.player.chromecastAvailable;
export const isMusicChromecasting = state => state.player.chromecasting;
export const isShuffle = state => state.player.shuffle;
export const isRepeat = state => state.player.repeat;
export const getQueue = state => state.player.queue;
export const getDuration = state => getTrack(state) && getTrack(state).duration;
export const getCurrentTime = state => state.player.currentTime;
//export const getPrimaryColor = state => getTrack(state) && getTrack(state).primaryColor;
export const getDownloads = state => state.player.downloads;
export const getShowPlayer = state => state.player.show;
export const getPrimaryColor = state => state.player.primaryColor;

export const getTrackInfos = createSelector(
  getArtist,
  getAlbum,
  getTrackName,
  getCoverURL,
  (artist, album, title, coverURL) => ({artist, album, title, coverURL})
);

// reducers
export default (state = {}, action) => {
  const { type } = action;
  switch (type) {
    case SET_ARTIST:
      return {
        ...state,
        artist: action.artist
      }

    case SET_COVER_URL:
      return {
        ...state,
        coverURL: action.cover
      }

    case SET_TRACK:
      return {
        ...state,
        playing: true,
        artist: action.artist,
        album: action.album,
        coverURL: action.coverURL,
        track: action.track,
        currentIndex: action.index
      }

    case SET_CURRENT_INDEX:
      return {
        ...state,
        currentIndex: action.index
      }

    case SET_TRACKS:
      return {
        ...state,
        tracks: action.tracks
      }

    case SET_QUEUE:
      return {
        ...state,
        queue: action.queue
      }

    case SET_PRIMARY_COLOR:
      return {
        ...state,
        primaryColor: action.primaryColor
      }

    case SWITCH_PLAYING_STATUS:
      return {
        ...state,
        playing: !state.playing
      }

    case SWITCH_PLAYER_STATUS:
      return {
        ...state,
        show: action.show
      }

    case SWITCH_REPEAT_STATUS:
      return {
        ...state,
        repeat: !state.repeat
      }

    case SWITCH_SHUFFLE_STATUS:
      return {
        ...state,
        shuffle: !state.shuffle
      }

    case SET_PLAYING_STATUS:
      return {
        ...state,
        playing: action.playing
      }

    case SET_CHROMECAST_AVAILABLE:
      return {
        ...state,
        chromecastAvailable: action.available
      }

    case SET_CHROMECAST_STATUS:
      return {
        ...state,
        chromecasting: action.chromecasting
      }

    case SET_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.time
      }

    case SET_DOWNLOAD_PERCENTAGE:
      return {
        ...state,
        downloads: {
          ...state.downloads,
          [action.id]: action.percentage
        }
      }

    case REMOVE_DOWNLOAD_PERCENTAGE:
      return {
        ...state,
        downloads: {
          ...state.downloads,
          [action.id]: null
        }
      }

    default:
      return state;
  }
}
