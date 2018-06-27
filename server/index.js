const {promisify} = require('util');
const fs = require('fs');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const compression = require('compression');
const express = require('express');
const dotenv = require('dotenv').config();
const removeHash = require('./middlewares/remove-hash');
const session = require('./middlewares/session');
const userMiddleware = require('./middlewares/user-middleware');

const app = express();
const server = http.createServer(app);

const production = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const staticOptions = {
  maxAge: production ? (365 * 24 * 60 * 60 * 1000) : 0
}

// middlewares
app.use(session);
app.use(userMiddleware);
app.use(removeHash);
app.use(bodyParser.json());
app.use(compression());

// static files
app.use('/static', serveStatic(path.join(__dirname, '../dist'), staticOptions));

// routes
app.get('/health', (req, res) => res.send('streamwave server is up.'));
app.use('/auth', require('./auth'));
app.use('/library', require('./library'));
//app.use('/push', require('./push'));
app.use('/service-worker.js', require('./service-worker'));
app.use('/', require('./dynamic'));

server.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

