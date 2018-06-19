const webpush = require('web-push');
const { get, set, del } = require('../datastore');

function getVapidKeys (req, res) {
  // send public key to user
  get('vapid-keys').then(keys => {
    const keysJSON = JSON.parse(keys);
    const {publicKey} = keysJSON;
    res.status(200).send(publicKey);
  }).catch(err => {
    console.error(err);
    res.status(500).send('Error when retrieving notification subscription key');
  });
}

function subscribe (req, res) {
  const subscription = req.body;
  set(subscription.endpoint, JSON.stringify(subscription)).then(_ => {
    res.status(200).end();
  }).catch(err => {
    console.error(err);
    res.status(500).end();
  });
}

function push (subscriptionId, album) {
  return get(subscriptionId).then(subscription => {
    if (!subscription) {
      return;
    }

    const message = JSON.stringify({
      album,
      message: `${album} est disponible dans votre catalogue`
    });

    return webpush.sendNotification(JSON.parse(subscription), message);
  }).catch(err => {
    console.error(err);
  });
}

function unsubscribe (req, res) {
  const {endpoint} = req.body;
  del(subscription.endpoint).then(_ => {
    res.status(200).end();
  }).catch(err => {
    console.error(err);
    res.status(500).end();
  });
}

const initPushService = async () => {
  let keys = JSON.parse(await get('vapid-keys'));
  if (!keys) {
    keys = webpush.generateVAPIDKeys();
    await set('vapid-keys', JSON.stringify(keys));
  }

  webpush.setVapidDetails(
    'https://www.streamwave.be',
    keys.publicKey,
    keys.privateKey
  );
}

module.exports = {
  initPushService,
  getVapidKeys,
  subscribe,
  push,
  unsubscribe
}
