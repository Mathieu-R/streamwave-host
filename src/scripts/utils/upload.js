import { EventEmitter } from 'events';
import store from '../store';
import { toasting } from '../store/toast';

class Uploader extends EventEmitter {
  constructor () {
    super();
    this.xhr = null;

    this.onSuccess = this.onSuccess.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onUploadStart = this.onUploadStart.bind(this);
    this.onUploadSucessed = this.onUploadSucessed.bind(this);
    this.onUploadFinished = this.onUploadFinished.bind(this);
    this.onError = this.onError.bind(this);
  }

  // fetch does not support upload progress //
  // streams only work for download-progress //
  // waiting for FetchObserver //
  upload (url, files, subscription) {
    this.xhr = new XMLHttpRequest();
    this.xhr.open('POST', url, true);
    this.xhr.setRequestHeader('authorization', `Bearer ${localStorage.getItem('streamwave-token')}`);

    if (subscription) {
      this.xhr.setRequestHeader('x-push-id', subscription.toJSON().endpoint);
    }

    this.xhr.upload.addEventListener('loadstart', this.onUploadStart);
    this.xhr.upload.addEventListener('progress', this.onProgress);
    this.xhr.upload.addEventListener('load', this.onUploadSucessed);
    this.xhr.upload.addEventListener('loadend', this.onUploadFinished);
    this.xhr.addEventListener('load', this.onSuccess);
    this.xhr.addEventListener('error', this.onError);

    this.xhr.send(files);
  }

  async inBackground (url, files, subscription, id) {
    // get service worker registration
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) {
      return;
    }

    let headers = {
      'authorization': `Bearer ${localStorage.getItem('streamwave-token')}`
    }

    if (subscription) {
      headers = {...headers, 'x-push-id': subscription.toJSON().endpoint}
    }

    // request object
    const request = new Request(url, {body: files, method: 'POST', headers});

    // options
    const icons = [
      {
        "src": "/assets/icons/icon-128x128.png",
        "type": "image/png",
        "sizes": "192x192"
      },
      {
        "src": "/assets/icons/icon-192x192.png",
        "type": "image/png",
        "sizes": "192x192"
      },
      {
        "src": "/assets/icons/icon-512x512.png",
        "type": "image/png",
        "sizes": "512x512"
      }
    ];

    const options = {
      icons,
      title: 'Téléversement en cours'
    }

    return registration.backgroundFetch.fetch(id, request, options);
  }

  onUploadStart (evt) {
    this.emit('upload-started');
  }

  onProgress (evt) {
    if (!evt.lengthComputable) {
      console.warn('[Upload Progress] Unknown total size.');
      return;
    }

    this.emit('upload-progress', {
      uploaded: evt.loaded,
      total: evt.total
    });
  }

  // fire when upload success
  onUploadSucessed () {
    store.dispatch(toasting([
      'Fichiers envoyés avec succès',
      'Votre album sera bientôt disponible dans votre catalogue'
    ], ['dismiss'], 8000));
  }

  // loadend event
  // fire whenever
  // upload success or fails
  // leverage this to remove progress bar
  onUploadFinished () {
    this.emit('upload-finished');
  }

  onSuccess (evt) {
    console.log('Request successed');
  }

  onError (evt) {
    console.error('Error when uploading...');
  }

  abort () {
    return this.xhr.abort();
  }
}

export default Uploader;
