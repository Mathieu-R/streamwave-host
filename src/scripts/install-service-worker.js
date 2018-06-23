import Constants from './constants';
import Toast from './components/toast';
import Pusher from './utils/push-notifications';

import {
  updateDataVolume
} from './utils/download';

export default () => {
  if (Constants.SUPPORT_SERVICE_WORKER) {
    navigator.serviceWorker.register('/static/service-worker.js', {scope: '/'}).then(registration => {
      if (Constants.SUPPORT_PUSH_NOTIFICATIONS) {
        const pusher = new Pusher();
        pusher.init();
      }

      // if an update is found
      // we should have a service-worker installing
      let firstTimeCached = false;
      registration.onupdatefound = event => {
        console.log('A new service worker has been found, installing...');

        registration.installing.onstatechange = event => {
          console.log(`Service Worker ${event.target.state}`);

          if (firstTimeCached) {
            return;
          }

          // first time service-worker installed.
          if (event.target.state === 'installed' && !navigator.serviceWorker.controller) {
            firstTimeCached = true;
            Toast.create(['Streamwave cached', 'Ready to work offline']);
            return;
          }

          // new update
          if (event.target.state === 'activated' && navigator.serviceWorker.controller) {
            Toast.create(['Streamwave updated', 'Refresh to get the new version'], ['reload'], 8000);
            return;
          }
        }
      }

      navigator.serviceWorker.onmessage = event => {
        if (event.data.type === 'downloading') {
          // value is the bit that's been downloaded for a chunk
          // with that I am consistant with shaka-player streaming track
          const {tracklistId, downloaded, totalDownload, value} = event.data;
          //store.dispatch(setDownloadPercentage({id: tracklistId, percentage: (downloaded / totalDownload)}));
          //updateDataVolume({userId: store.getState().user.id, value})
          return;
        }

        if (event.data.type === 'downloaded') {
          const {tracklistId} = event.data;
          //store.dispatch(removeDownloadPercentage({id: tracklistId}));
        }
      }
    }).catch(err => console.error(err));
  }
}
