const {promisify} = require('util');
const http = require('http');
const path = require('path');
const fs = require('fs');
const validator = require('express-validator');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const compression = require('compression');
const express = require('express');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const promisify = require('es6-promisify');
const ssl = require('heroku-ssl-redirect');
const removeHash = require('../middlewares/remove-hash');

const app = express();
const server = http.createServer(app);
const router = express.Router();

const production = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// middlewares
router.use(bodyParser.json());

// routes
router.use('/static', )
router.use('/auth', require('./auth'));
router.use('/library', require('./library'));
router.use('/push', require('./push'));
router.use('/sw.js', require('./service-worker'));
router.use('/', require('./dynamic'));

app.use(router);

server.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

