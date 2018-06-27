const express = require('express');
const app = express();

const {
  initPushService, getVapidKeys, subscribe, unsubscribe
} = require('./controllers/push-notifications');

// init push notification service
initPushService().catch(err => console.error(err));

app.get('/push', getVapidKeys);
app.post('/push/subscribe', subscribe);
app.post('/push/unsubscribe', unsubscribe);

module.exports = app;
