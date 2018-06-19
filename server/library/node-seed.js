const fs = require('fs');
const seed = JSON.parse(fs.readFileSync('./seed.json'));
const {insertAlbums} = require('./seed');

insertAlbums(seed)
  .then(albums => {
    process.exit(1);
  })
  .catch(err => {
    console.error(err);
    process.exit(0);
  });
