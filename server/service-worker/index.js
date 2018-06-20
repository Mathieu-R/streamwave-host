const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const router = express.Router();
const adaro = require('adaro');

const templatePath = path.join(__dirname, '../../src');
const production = process.env.NODE_ENV === 'production';

const options = {
  cache: production ? true : false,
  whitespace: true,
  helpers: [
    require('../helpers/add-hash')
  ]
};

const package = JSON.parse(fs.readFileSync('package.json'));
const version = package['version'];

app.engine('js', adaro.dust(options));
app.set('view engine', 'js');
app.set('views', templatePath);

app.use('../middlewares/no-cache');

app.get('service-worker.js', (req, res) => {
  res.set({'Content-Type': 'application/javascript'});
  res.status(200).render('service-worker', {
    version
  });
});

app.use(router);

module.exports = app;
