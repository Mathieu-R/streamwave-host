const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const adaro = require('adaro');

const production = process.env.NODE_ENV === 'production';
const staticPath = path.join(__dirname, '../../dist');
const templatePath = path.join(__dirname, '../../src/templates');
let inlineStyle = null;

// only inline style in production
if (production) {
  inlineStyle = fs.readFileSync(path.join(__dirname, '../../dist/css/inline.css'), 'utf-8');
}

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

const viewOptions = {
  title: 'Streamwave',
  styles: [path.join(staticPath, 'css/streamwave.css')],
  inlineStyle,
  scripts: [path.join(staticPath, 'scripts/bundle.js')]
}

app.engine('dust', adaro.dust(options));
app.set('view engine', 'dust');
app.set('views', templatePath);

app.get('/', (req, res) => {
  // stuff
});

module.exports = app;
