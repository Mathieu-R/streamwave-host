const fs = require('fs');
const path = require('path');
const cleanCSS = require('clean-css');
const cssPath = path.join(__dirname, '../dist/css/streamwave.css');
const inlinePath = path.join(__dirname, '../dist/css/critical.css');

fs.writeFileSync(cssPath, new cleanCSS().minify([cssPath]).styles);
fs.writeFileSync(inlinePath, new cleanCSS().minify([inlinePath]).styles);
