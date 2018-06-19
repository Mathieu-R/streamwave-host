module.exports = (req, res, next) => {
  res.set({cache: 'private, no-cache'});
  next();
}
