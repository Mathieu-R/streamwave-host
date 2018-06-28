const {promisify} = require('util');
const {OAuth2Client} = require('google-auth-library');
const UserAccount = require('../models/UserAccount');
const userObject = require('../utils/user-object');
const production = process.env.NODE_ENV === 'production';

const oauth2client = new OAuth2Client(
  process.env.GOOGLEID,
  process.env.GOOGLESECRET,
  production ? process.env.GOOGLECALLBACKPROD : process.env.GOOGLECALLBACKDEV
);

async function authenticateUser (token) {
  const loginTicket = await oauth2client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLEID
  });
  const profile = loginTicket.getPayload();

  return UserAccount.findOneAndUpdate({userId: profile.sub}, {
    userId: profile.sub,
    username: profile.name,
    email: profile.email,
    avatar: profile.picture.replace(/\?.*$/, ''),
  }, {
    // upsert => if doc does not exist => create it.
    // new => return the new updated doc and not the old one.
    upsert: true,
    new: true
  });
}

function handleGoogleLogin (req, res) {
  const authorizationHeader = req.headers.authorization;
  const id_token = authorizationHeader.split(' ')[1];
  authenticateUser(id_token).then(user => {
    // set session.
    req.session.userId = user.userId;
    // do not redirect user to home page
    // cause we have to save user credentials.
    res.status(200).json({user: userObject(user)});
  }).catch(err => {
    res.status(500).send(`Auth failed. ${err.message}`);
  });
}

module.exports = {
  handleGoogleLogin
}
