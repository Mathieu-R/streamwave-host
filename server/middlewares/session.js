const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('../mongoose');
const production = process.env.NODE_ENV === 'production';

module.exports = session({
  secret: process.env.SESSION_PASSWORD,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 12, // 12h
    secure: production ? true : false,
    httpOnly: true
  },
  proxy: true,
  resave: false,
  saveUninitialized: false
});
