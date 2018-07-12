const fs = require('fs');
const path = require('path');
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json')));
const {insertAlbums} = require('./seed');

insertAlbums(seed)
  .then(albums => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
