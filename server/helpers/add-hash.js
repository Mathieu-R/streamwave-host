const {promisify} = require('util');
const fs = require('fs');
const crypto = require('crypto');

const readFile = promisify(fs.readFile);
const join = require('path').join;

function createHash(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

function hash(dust) {
  dust.helpers.hash = (chunk, context, bodies, params) => {
    return chunk.map(async chunk => {
      const path = params.path;
      const content = await readFile(join(__dirname, '../../', path));
      const hash = await createHash(content);
      const hashedPath = path
        .replace(/\/?dist/, '/static')
        .replace(/([^\.]+)\.(.+)/, `$1.${hash}.$2`);
      return chunk.write(hashedPath).end();
    });
  }
}

module.exports = hash;
