const mongoose = require('../../mongoose');

const googleAccountSchema = new mongoose.Schema({
  googleId: {type: String, unique: true},
  username: {type: String, unique: true, required: true},
  email: {type: String, unique: true, required: true},
  avatar: {type: String, default: '/assets/svg/ic_face_white_24px.svg'}
});

const GoogleAccount = mongoose.model('GoogleAccount', googleAccountSchema);
module.exports = GoogleAccount;
