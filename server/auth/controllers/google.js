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

const authorizeURL = oauth2client.generateAuthUrl({
  access_type: 'offline',
  scope: ['openid', 'email', 'profile']
});

async function authenticateUser (code) {
  const {tokens} = await oauth2client.getToken(code);
  //console.log(tokens);
  await oauth2client.setCredentials(tokens);
  const loginTicket = await oauth2client.verifyIdToken({
    idToken: tokens.id_token,
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
  res.redirect(authorizeURL);
}

function handleGoogleCallback (req, res) {
  const {code} = req.query;
  authenticateUser(code).then(user => {
    // set session.
    req.session.userId = user.userId;
    res.redirect('/');
  }).catch(err => {
    console.error(err);
    res.status(500).send(`Auth failed. ${err.message}`);
  });
}

module.exports = {
  handleGoogleLogin,
  handleGoogleCallback
}
