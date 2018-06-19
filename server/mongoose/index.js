const mongoose = require('mongoose');
const production = process.env.NODE_ENV === 'production';
const DBURL = production ? process.env.DBURL_PROD : process.env.DBURL_DEV;
mongoose.Promise = global.Promise;

mongoose.connect(DBURL)
  .catch(err => console.error(err));

module.exports = mongoose;

