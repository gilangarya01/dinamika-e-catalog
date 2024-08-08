function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect("/admin");
  }
}

module.exports = { isAuthenticated };
