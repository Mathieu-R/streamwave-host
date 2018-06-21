const express = require('express');
const app = express();
const router = express.Router();

const {
  initPushService, getVapidKeys, subscribe, unsubscribe
} = require('./controllers/push-notifications');

// init push notification service
initPushService().catch(err => console.error(err));

router.get('/push', getVapidKeys);
router.post('/push/subscribe', subscribe);
router.post('/push/unsubscribe', unsubscribe);

app.use(router);

module.exports = app;
