import { set, get } from 'idb-keyval';

class SettingsManager {
  // Firefox need a constructor !
  // even if it is empty
  // otherwise class silently fails
  constructor () {}

  static get IDB_KEY () {
    return 'streamwave-settings';
  }

  static get INITIAL_SETTINGS () {
    const settings = {};

    settings['fade'] = 0;
    settings['download-mobile-network'] = true;
    settings['notifications'] = false;
    settings['download-quality'] = 256;
    settings['limit-data'] = false;
    settings['data-max'] = 0;

    return settings;
  }

  async init () {
    let settings = await get(SettingsManager.IDB_KEY);
    if (settings) {
      return;
    }

    settings = SettingsManager.INITIAL_SETTINGS;
    return set(SettingsManager.IDB_KEY, settings);
  }

  getAll () {
    return get(SettingsManager.IDB_KEY);
  }

  async get (key) {
    const settings = await get(SettingsManager.IDB_KEY);
    return settings[key];
  }

  async set (key, value) {
    const settings = await get(SettingsManager.IDB_KEY);
    settings[key] = value;
    return set(SettingsManager.IDB_KEY, settings);
  }

  async clear () {
    await set(SettingsManager.IDB_KEY, SettingsManager.INITIAL_SETTINGS);
    return SettingsManager.INITIAL_SETTINGS;
  }
}

export default SettingsManager;
