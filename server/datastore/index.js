const {promisify} = require('util');
const redis = require('redis');
const client = redis.createClient({
  password: process.env.REDIS_PASSWORD
});

const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client);

client.on('error', err => console.error(err));
client.on('reconnecting', _ => console.log('datastore reconnecting...'));
client.on('end', _ => console.log('datastore killed.'));

module.exports = {
  get,
  set,
  del
}
