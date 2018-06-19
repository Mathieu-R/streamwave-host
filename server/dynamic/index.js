const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const production = process.env.NODE_ENV === 'production';
const staticPath = './static';
const templatePath = './templates';

const options = {
  cache: production ? true : false,
  whitespace: production ? false : true,
  helpers: [
    require('../../helpers/add-hash')
  ]
};

const viewOptions = {
  title: 'Portfolio',
  styles: [path.join(staticPath, 'styles', 'style.css')],
  scripts: [path.join(staticPath, 'scripts', 'bundle.js')]
}

app.engine('dust', adaro.dust(options));
app.set('view engine', 'dust');
app.set('views', templatePath);

app.get('/', (req, res) => {
  // stuff
});
