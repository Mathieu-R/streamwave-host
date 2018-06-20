const {promisify} = require('util');
const fs = require('fs');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const compression = require('compression');
const express = require('express');
const dotenv = require('dotenv').config();
const removeHash = require('../middlewares/remove-hash');

const app = express();
const server = http.createServer(app);
const router = express.Router();

const production = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const staticOptions = {
  maxAge: production ? (365 * 24 * 60 * 60 * 1000) : 0
}

// middlewares
router.use(removeHash);
router.use(bodyParser.json());
router.use(compression());

// static files
router.use('/static', serveStatic(path.join(__dirname, '../dist')), staticOptions);
router.use('/static/assets', serveStatic(path.join(__dirname, '../src/assets')), staticOptions);

// routes
router.use('/auth', require('./auth'));
router.use('/library', require('./library'));
router.use('/push', require('./push'));
router.use('/sw.js', require('./service-worker'));
router.use('/', require('./dynamic'));

app.use(router);

server.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

