const fs = require('fs');
const cleanCSS = require('clean-css');
const path = 'dist/css/streamwave.css';
const inlinePath = 'dist/css/inline.css';

fs.writeFileSync(path, new cleanCSS().minify([path]).styles);
fs.writeFileSync(inlinePath, new cleanCSS().minify([path]).styles);
