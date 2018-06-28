const auth = (req, res, next) => {
  if (!req.user) {
    res.status(401).send('Unauthorized access. Please log in...');
    //res.redirect('/auth');
    return;
  }

  next();
}

module.exports = auth;
