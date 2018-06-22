const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const production = process.env.NODE_ENV === 'production';

module.exports = session({
  secret: process.env.REDIS_PASSWORD,
  name: 'auth',
  store: new RedisStore({
    host: '127.0.0.1',
    port: 6379
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 12, // 12h
    secure: production ? true : false,
    httpOnly: true
  },
  proxy: false,
  resave: false,
  saveUninitialized: false
});
