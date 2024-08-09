function isAuthenticated(req, res, next) {
  if (req.session.admin) {
    return next();
  } else {
    res.redirect("/admin");
  }
}

module.exports = { isAuthenticated };
