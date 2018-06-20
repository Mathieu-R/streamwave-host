const removeHash = (req, res, next) => {
  req.url = req.url.replace(/[a-f0-9]{64}\./, '');
  next();
}

module.exports = removeHash;
