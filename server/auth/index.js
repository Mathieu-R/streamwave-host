const http = require('http');
const path = require('path');
const express = require('express');
const passport = require('passport');
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

const {
  handleGoogleLogin, handleGoogleCallback
} = require('./controllers/google');
const {logout} = require('./controllers/common');

const app = express();

// middlewares
app.use(passport.initialize());

app.post('/local/register', checkAuthInfos, checkErrors, register);
app.get('/local/account/validate', checkToken, checkErrors, validateAccount);
app.post('/local/login', checkAuthInfos, checkErrors, login);
app.post('/local/account/reset/get-reset-token', checkEmail, checkErrors, getResetToken);
app.get('/local/account/reset/check-reset-token', checkToken, checkErrors, checkResetToken);
app.post('/local/account/reset/change-password', checkToken, checkPassword, checkErrors, resetPassword);

app.get('/google/login', handleGoogleLogin);
app.get('/google/oauth2callback', handleGoogleCallback);
app.delete('/logout', logout);

module.exports = app;
