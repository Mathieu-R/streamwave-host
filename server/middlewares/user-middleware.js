const UserAccount = require('../auth/models/UserAccount');
const userObject = require('../auth/utils/user-object');

const userMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    next();
    return;
  }

  const userId = req.session.userId;

  UserAccount.findOne({userId}).then(user => {
    // if (!user) {
    //   next();
    //   return;
    // }

    req.user = userObject(user);
    next();
  });
}

module.exports = userMiddleware;
