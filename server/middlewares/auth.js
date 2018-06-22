const UserAccount = require('../auth/models/UserAccount');
const userObject = require('../auth/utils/user-object');

const auth = (req, res, next) => {
  if (!req.session.userId) {
    //res.status(401).send('Unauthorized access. Please log in...');
    res.redirect('/auth');
    return;
  }

  const userId = req.session.userId;

  UserAccount.findOne({_id: userId, googleId: userId}).then(user => {
    if (!user) {
      //res.status(401).send('Unauthorized access. User does not exist...');
      res.redirect('/auth');
      return;
    }

    req.user = userObject(user);
  });
}

module.exports = auth;
