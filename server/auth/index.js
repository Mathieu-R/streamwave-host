const http = require('http');
const path = require('path');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const mongoose = require('../mongoose');

const {
  checkAuthInfos,
  checkToken,
  checkEmail,
  checkPassword,
  checkOauth2IdTokenInAuthorizationHeader,
  checkErrors
} = require('./middlewares/validator');

const {
  register, validateAccount, login,
  getResetToken, checkResetToken, resetPassword
} = require('./controllers/local');

const {handleGoogleLogin} = require('./controllers/google');
const {logout} = require('./controllers/common');

const app = express();
const server = http.createServer(app);
const router = express.Router();

const production = process.env.NODE_ENV === 'production';

// middlewares
router.use(passport.initialize());

router.post('/local/register', checkAuthInfos, checkErrors, register);
router.get('/local/account/validate', checkToken, checkErrors, validateAccount);
router.post('/local/login', checkAuthInfos, checkErrors, login);
router.post('/local/account/reset/get-reset-token', checkEmail, checkErrors, getResetToken);
router.get('/local/account/reset/check-reset-token', checkToken, checkErrors, checkResetToken);
router.post('/local/account/reset/change-password', checkToken, checkPassword, checkErrors, resetPassword);

router.post('/google/login', checkOauth2IdTokenInAuthorizationHeader, checkErrors, handleGoogleLogin);
router.delete('/logout', logout);

app.use(router);

module.exports = app;
