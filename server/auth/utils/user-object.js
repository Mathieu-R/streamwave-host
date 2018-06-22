const userObject = (user) => ({
  id: user.googleId || user._id.toString(),
  username: user.username,
  email: user.email,
  avatar: user.avatar
});

module.exports = userObject;
