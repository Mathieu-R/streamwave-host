import { h, Component } from 'preact';
import { connect } from 'react-redux';
import { set } from 'idb-keyval';
import debounce from 'debounce';
import DownloadQuality from '../components/settings/download-quality';
import DownloadWithMobileNetwork from '../components/settings/download-mobile-network';
import Notifications from '../components/settings/notifications';
import StorageQuota from '../components/settings/storage-quota';
import DataVolume from '../components/settings/data-volume';
import { getDataVolumeDownloaded } from '../utils/download';
import Pusher from '../utils/push-notifications';
import Constants from '../constants';

import {
  getFade,
  getDownloadWithMobileNetwork,
  getAllowNotifications,
  getQuality,
  getLimitDataStatus,
  getDataMax,
  setFade,
  setDownloadWithMobileNetwork,
  setAllowNotifications,
  setDownloadQuality,
  setLimitDataStatus,
  setMaxDataVolume,
  setMaxDataVolumeInStore,
  clear
} from '../store/settings';

import {
  getUserId
} from '../store/user';

import {
  toasting
} from '../store/toast';

const mapStateToProps = state => ({
  fade: getFade(state),
  downloadWithMobileNetwork: getDownloadWithMobileNetwork(state),
  notifications: getAllowNotifications(state),
  quality: getQuality(state),
  limitData: getLimitDataStatus(state),
  dataMax: getDataMax(state),
  userId: getUserId(state)
});

const mapDispatchToProps = dispatch => ({
  setFade: value => dispatch(setFade(value)),
  setDownloadWithMobileNetwork: value => dispatch(setDownloadWithMobileNetwork(value)),
  setAllowNotifications: value => dispatch(setAllowNotifications(value)),
  setDownloadQuality: quality => dispatch(setDownloadQuality(quality)),
  setLimitDataStatus: status => dispatch(setLimitDataStatus(status)),
  setMaxDataVolume: value => dispatch(setMaxDataVolume(value)),
  clear: _ => dispatch(clear()),
  toasting: (message, buttons, duration) => dispatch(toasting(message, buttons, duration))
});

class Settings extends Component {
  constructor () {
    super();

    this.logout = this.logout.bind(this);
    this.onFadeChange = this.onFadeChange.bind(this);
    this.onQualityChange = this.onQualityChange.bind(this);
    this.onDownloadWithMobileNetworkChange = this.onDownloadWithMobileNetworkChange.bind(this);
    this.onAllowNotificationsChange = this.onAllowNotificationsChange.bind(this);
    this.onLimitDataStatusChange = this.onLimitDataStatusChange.bind(this);
    this.onMaxDataVolumeChange = this.onMaxDataVolumeChange.bind(this);
    this.resetDataVolume = this.resetDataVolume.bind(this);
    this.clearCache = this.clearCache.bind(this);
    this.restore = this.restore.bind(this);

    this.state = {
      volume: 0
    }
  }

  componentWillMount () {
    if (!this.props.dataMax) {
      return;
    }

    getDataVolumeDownloaded({
      userId: this.props.userId
    }).then(({volume}) => {
      this.setState({
        volume
      });
    });
  }

  componentDidMount () {
    this.pusher = new Pusher();
  }

  onFadeChange (value) {
    // avoid unnecessary update
    if (value === this.props.fade) {
      return;
    }

    this.props.setFade(value);
  }

  onDownloadWithMobileNetworkChange (evt) {
    const status = evt.target.checked;
    this.props.setDownloadWithMobileNetwork(status);
  }

  // TODO: rewrite
  onAllowNotificationsChange (evt) {
    const allow = evt.target.checked;
    this.props.setAllowNotifications(allow);

    if (allow) {
      this.pusher.subscribe().catch(err => {
        console.error(err);
        this.props.setAllowNotifications(false);
      });
    } else {
      this.pusher.unsubscribe().catch(err => {
        console.error(err);
        this.props.setAllowNotifications(true);
      });
    }
  }

  onQualityChange (evt) {
    const {value} = evt.target;
    this.props.setDownloadQuality(value)
  }

  onLimitDataStatusChange (evt) {
    const status = evt.target.checked;
    this.props.setLimitDataStatus(status);
  }

  onMaxDataVolumeChange (value) {
    this.props.setMaxDataVolume(value);
    // debounce to avoid too much access to idb
    const debounced = debounce(setMaxDataVolumeInStore, 300);
    debounced(value);
  }

  resetDataVolume () {
    this.setState({volume: 0});
    return set(`data-volume_${this.props.userId}`, 0);
  }

  // clear settings idb cache
  restore () {
    this.props.clear().then(() => {
      this.props.toasting(['Paramètres restaurés !']);
    });
  }

  // clear service-worker cache
  clearCache (evt) {
    caches.delete('streamwave-music-cache')
      .then(() => this.props.toasting(['Cache vidé !']))
      .catch(err => console.error(err));
  }

  logout (evt) {
    if (Constants.SUPPORT_PREVENT_SILENT_ACCESS) {
      // disable auto signin next visite
      // until user signin again
      navigator.credentials.preventSilentAccess().then(_ => {
        localStorage.removeItem('streamwave-token');
        this.props.history.push('/auth');
      });
    }
  }

  render ({fade, downloadWithMobileNetwork, notifications, quality, limitData, dataMax}, {volume}) {
    return (
      <div class="settings">
        <div class="settings__container">
          {
            Constants.SUPPORT_NETWORK_INFORMATION_API &&
            <DownloadWithMobileNetwork
              value={downloadWithMobileNetwork}
              onChange={this.onDownloadWithMobileNetworkChange}
            />
          }
          {
            Constants.SUPPORT_PUSH_NOTIFICATIONS &&
            <Notifications
              value={notifications}
              onChange={this.onAllowNotificationsChange}
            />
          }
          <DownloadQuality
            quality={quality.toString()}
            onChange={this.onQualityChange}
          />
          { Constants.SUPPORT_STORAGE_API &&
            <StorageQuota />
          }
          <DataVolume
            limitData={limitData}
            dataMax={dataMax}
            volume={volume}
            resetDataVolume={this.resetDataVolume}
            onLimitDataStatusChange={this.onLimitDataStatusChange}
            onMaxDataVolumeChange={this.onMaxDataVolumeChange}
          />
          <div class="settings__buttons">
            { Constants.SUPPORT_CACHE_API &&
              <button class="settings__button" onClick={this.clearCache} aria-label="clear cache">Vider le cache</button>
            }
            <button class="settings__button" onClick={this.restore} aria-label="restore settings">Restaurer</button>
            <button class="settings__button" onClick={this.logout} aria-label="logout">Déconnexion</button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
