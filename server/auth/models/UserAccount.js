const mongoose = require('../../mongoose');
const bcrypt = require('bcrypt');

const userAccountSchema = new mongoose.Schema({
  googleId: {type: String, unique: true},
  username: {type: String, unique: true},
  email: {type: String, unique: true, required: true},
  avatar: {type: String, default: '/assets/svg/avatar.svg'},
  hash: {type: String, required: true},
  email_verification_token: {
    content: {type: String},
    expiration: {type: Date},
    validated: {type: Boolean, required: true, default: false}
  },
  reset_password_token: {
    content: {type: String},
    expiration: {type: Date}
  }
});

userAccountSchema.methods.hashPassword = function (password) {
  return bcrypt.genSalt(12)
    .then(salt => bcrypt.hash(password, salt))
    .then(hash => this.hash = hash)
}

userAccountSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.hash);
}

userAccountSchema.methods.ensureEmailValidated = function () {
  return this.email_verification_token.validated;
}

const UserAccount = mongoose.model('UserAccount', userAccountSchema);
module.exports = UserAccount;
