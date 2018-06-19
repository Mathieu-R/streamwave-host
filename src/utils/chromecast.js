import store from '../store';
import Constants from '../constants';
import {
  setChromecastAvailable,
  setChromecastStatus
} from '../store/player';

class Chromecaster {
  constructor (castProxy) {
    this.castProxy = castProxy;
    this.onCastStatusChange = this.onCastStatusChange.bind(this);
    this.castProxy.addEventListener('caststatuschanged', this.onCastStatusChange);

    this.castReceiver = document.querySelector('.top-bar__cast-receiver');
    this.castReceiverName = document.querySelector('.top-bar__cast-receiver__name');
  }

  castIfNeeded () {
    if (this.castProxy.isCasting()) {
      this.stop();
      //this.updateUI({chromecasting: false});
      return;
    }

    this.castProxy.setAppData(this.getMediaInfo());
    this.castProxy.cast().then(() => {
      console.log(`casting on a remote device: ${this.castProxy.receiverName()}`);
      // innerText FTW
      this.castReceiverName.innerText = this.castProxy.receiverName();
      this.castReceiver.classList.add('top-bar__cast-receiver--visible');
    }).catch(err => {
      console.error(err);
    })
  }

  onCastStatusChange () {
    const canCast = this.castProxy.canCast();
    const isCasting = this.castProxy.isCasting();

    if (this.canCast !== canCast) {
      this.canCast = canCast;
      this.updateChromecastButtonDisplay({available: this.canCast ? true : false});
    }

    if (this.isCasting !== isCasting) {
      this.isCasting = isCasting;
      this.updateUI({chromecasting: this.isCasting ? true : false});
    }

    // we stop casting
    if (!isCasting) {
      this.castReceiver.classList.remove('top-bar__cast-receiver--visible');
    }
  }

  stop () {
    // Show a dialog where user can choose to disconnect from the cast connection
    // could also force with forceDisconnect()
    this.castProxy.suggestDisconnect();
  }

  updateReceiverUI () {
    this.castProxy.setAppData(this.getMediaInfo());
  }

  getMediaInfo () {
    const state = store.getState();
    const data = {
      artist: state.player.artist,
      album: state.player.album,
      title: state.player.track.title,
      coverURL: `${Constants.CDN_URL}/${state.player.track.coverURL}`,
      currentTime: state.player.currentTime,
      duration: state.player.track.duration
    };
    return data;
  }

  updateChromecastButtonDisplay ({available}) {
    return store.dispatch(setChromecastAvailable({available}));
  }

  updateUI ({chromecasting}) {
    return store.dispatch(setChromecastStatus({chromecasting}));
  }
}

export default Chromecaster;
