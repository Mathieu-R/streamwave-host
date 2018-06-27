const fs = require('fs');
const path = require('path');
const express = require('express');
const adaro = require('adaro');

const auth = require('../middlewares/auth');
const { getLibrary, getAlbum } = require('../library/controllers/library');

const { CDN_URL } = process.env;

const app = express();

const production = process.env.NODE_ENV === 'production';
const staticPath = path.join(__dirname, '../../dist');
const templatePath = path.join(__dirname, '../../src/templates');

const inlineStyle = fs.readFileSync(path.join(staticPath, 'css/critical.css'), 'utf-8');

const options = {
  cache: production ? true : false,
  whitespace: production ? false : true,
  helpers: [
    require('../helpers/add-hash')
  ],
  filters: [
    require('../filters/duration'),
    require('../filters/pluralize'),
    require('../filters/rgbcss')
  ]
};

// basic view options
const viewOptions = {
  title: 'Streamwave',
  styles: ['dist/css/streamwave.css'],
  inlineStyle,
  scripts: ['dist/scripts/bundle.js']
}

// view options when user
// is authenticated in the app
const appViewOptions = (req) => ({
  ...viewOptions, ...{
    user: req.user
  }
});

app.engine('dust', adaro.dust(options));
app.set('view engine', 'dust');
app.set('views', templatePath);

// auth
app.get('/auth', (req, res) => {
  res.status(200).render('sections/auth/home', viewOptions);
});

app.get('/auth/login', (req, res) => {
  res.status(200).render('sections/auth/login', viewOptions);
});

app.get('/auth/register', (req, res) => {
  res.status(200).render('sections/auth/register', viewOptions);
});

app.get('/auth/forgot', (req, res) => {
  res.status(200).render('sections/auth/forgot', viewOptions);
});

app.get('/auth/reset/:token', (req, res) => {
  res.status(200).render('sections/auth/reset', viewOptions);
});

// app
app.get('/', auth, (req, res) => {
  getLibrary(req).then(library => {
    res.status(200).render('sections/library', {
      ...viewOptions,
      user: req.user,
      library,
      cdnurl: CDN_URL
    });
  });
});

module.exports = app;
