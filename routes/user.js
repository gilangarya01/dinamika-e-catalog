const express = require("express");

const router = express.Router();

router.get("/", (req, res) => res.render("login.ejs"));

router.get("/registrasi", (req, res) => res.render("registrasi.ejs"));

router.post("/registrasi", (req, res) => {
  const db = req.db;
  if (req.body.password !== req.body.repassword) {
    return res.render("registrasi.ejs");
  }

  const newUser = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    level: 1,
  };

  db.collection("users")
    .insertOne(newUser)
    .then(() => res.redirect("/"))
    .catch((err) => {
      console.error("Error: " + err);
      res.status(500).send("User addition failed");
    });
});

router.get("/home", (req, res) => res.render("user/home.ejs"));
router.get("/products", (req, res) => res.render("user/products.ejs"));

module.exports = router;
