import SettingsManager from '../../utils/settings-manager';
const manager = new SettingsManager();

// types
const RESTORE_SETTINGS = 'RESTORE_SETTINGS';
const SET_FADE = 'SET_FADE';
const SET_EQUALIZE_VOLUME = 'SET_EQUALIZE_VOLUME';
const SET_EQUALIZER = 'SET_EQUALIZER';
const SET_DOWNLOAD_WITH_MOBILE_NETWORK = 'SET_DOWNLOAD_WITH_MOBILE_NETWORK';
const SET_ALLOW_NOTIFICATIONS = 'SET_ALLOW_NOTIFICATIONS';
const SET_DOWNLOAD_QUALITY = 'SET_DOWNLOAD_QUALITY';
const SET_LIMIT_DATA_STATUS = 'SET_LIMIT_DATA_STATUS';
const SET_DATA_VOLUME_MAX = 'SET_DATA_VOLUME_MAX';

export function restoreSettings () {
  return dispatch => {
    manager.init()
      .then(_ => manager.getAll())
      .then(settings => {
        dispatch({
          type: RESTORE_SETTINGS,
          settings
        });
      });
  }
}

// actions
export function setFade (value) {
  return dispatch => {
    manager.set('fade', value).then(_ => {
      dispatch({
        type: SET_FADE,
        value
      });
    });
  }
}

export function setDownloadWithMobileNetwork (status) {
  return dispatch => {
    manager.set('download-mobile-network', status).then(_ => {
      dispatch({
        type: SET_DOWNLOAD_WITH_MOBILE_NETWORK,
        status
      })
    });
  }
}

export function setAllowNotifications (status) {
  return dispatch => {
    manager.set('notifications', status).then(_ => {
      dispatch({
        type: SET_ALLOW_NOTIFICATIONS,
        status
      })
    });
  }
}

export function setDownloadQuality (quality) {
  return dispatch => {
    manager.set('download-quality', quality).then(_ => {
      dispatch({
        type: SET_DOWNLOAD_QUALITY,
        quality
      });
    });
  }
}

export function setLimitDataStatus (status) {
  return dispatch => {
    manager.set('limit-data', status).then(_ => {
      dispatch({
        type: SET_LIMIT_DATA_STATUS,
        status
      })
    })
  }
}

export function setMaxDataVolume (value) {
  return {
    type: SET_DATA_VOLUME_MAX,
    value
  }
}

export function clear () {
  return dispatch => {
    return manager.clear().then(settings => {
      dispatch({
        type: RESTORE_SETTINGS,
        settings
      })
    })
  }
}

export const setMaxDataVolumeInStore = (value) => {
  return manager.set('data-max', value);
}

// selectors
export const getFade = state => state.settings.fade;
export const getQuality = state => state.settings.downloadQuality;
export const getDownloadWithMobileNetwork = state => state.settings.downloadWithMobileNetwork;
export const getAllowNotifications = state => state.settings.allowNotifications;
export const getLimitDataStatus = state => state.settings.limitData;
export const getDataMax = state => state.settings.dataMax;

// reducers

export default (state = {}, action) => {
  const {type} = action;
  switch (type) {
    case RESTORE_SETTINGS:
      return {
        ...state,
        fade: action.settings['fade'],
        downloadWithMobileNetwork: action.settings['download-mobile-network'],
        allowNotifications: action.settings['notifications'],
        downloadQuality: action.settings['download-quality'],
        limitData: action.settings['limit-data'],
        dataMax: action.settings['data-max']
      }

    case SET_FADE:
      return {
        ...state,
        fade: action.value
      }

    case SET_DOWNLOAD_WITH_MOBILE_NETWORK:
      return {
        ...state,
        downloadWithMobileNetwork: action.status
      }

    case SET_ALLOW_NOTIFICATIONS:
      return {
        ...state,
        allowNotifications: action.status
      }

    case SET_DOWNLOAD_QUALITY:
      return {
        ...state,
        downloadQuality: action.quality
      }

    case SET_LIMIT_DATA_STATUS:
      return {
        ...state,
        limitData: action.status
      }

    case SET_DATA_VOLUME_MAX:
      return {
        ...state,
        dataMax: action.value
      }

    default:
      return state;
  }
}
