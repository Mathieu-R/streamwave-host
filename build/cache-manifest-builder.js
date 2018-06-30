const {promisify} = require('util');
const walk = require('walk');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ignores = [
  '.DS_Store',
  'sw.js'
];

const routes = [
  '/',
  '/search',
  '/settings',
  '/upload',
  '/licences',
  '/about',
  '/demo',
  '/auth/',
  '/album/',
  '/playlist/'
];

const hash = path => {
  const hashed = crypto
    .createHash('sha256')
    .update(fs.readFileSync(path))
    .digest('hex');

  return path.replace(/\.([^.]*?)$/, `.${hashed}.$1`);
}

const getResourcesList = () => {
  return new Promise((resolve, reject) => {
    const walker = walk.walk('./dist');
    const resourcesList = [];

    walker.on("file", (root, stat, next) => {
      const filename = stat.name;
      const diskFilePath = `${root}/${filename}`;
      let filepath;

      if (ignores.includes(filename)) {
        next();
      }

      root = root.replace('./dist', '/static');

      if (filename.endsWith('.js') ||
        filename.endsWith('.css') ||
        filename.endsWith('.json')
      ) {
        filepath = hash(diskFilePath).replace('./dist', '/static');
      } else {
        filepath = `${root}/${filename}`;
      }

      resourcesList.push(filepath);
      next();
    });

    walker.on('end', () => resolve(resourcesList));
  });
}

getResourcesList().then(resources => {
  const list = [...routes, ...resources];
  const cacheManifest = `const cacheManifest = ${JSON.stringify(list, null, 2)}`;
  return promisify(fs.writeFile)(path.resolve(__dirname, '../dist/cache-manifest.js'), cacheManifest);
}).catch(err => {
  console.error(err);
});
