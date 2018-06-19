const {
  initPushService, getVapidKeys, subscribe, unsubscribe
} = require('./controllers/push-notifications');

// init push notification service
initPushService().catch(err => console.error(err));

router.get('/push', getVapidKeys);
router.post('/push/subscribe', jwt, subscribe);
router.post('/push/unsubscribe', jwt, unsubscribe);
