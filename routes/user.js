const express = require("express");

const router = express.Router();

router.get("/login", (req, res) => res.render("login.ejs"));

router.post("/login", (req, res) => {
  const db = req.db;
  const query = {
    username: req.body.username,
    password: req.body.password,
  };

  db.collection("users")
    .findOne(query)
    .then((user) => {
      if (!user) {
        return res.render("user/home.ejs", { error: "User not found" });
      }
      req.session.user = user;
      res.redirect("/");
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

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

router.get("/", async (req, res) => {
  const db = req.db;
  user = req.session.user ? req.session.user : null;
  let newProduct = await db
    .collection("products")
    .find()
    .sort({ date: -1 })
    .limit(4)
    .toArray();
  let recommendProduct = await db
    .collection("products")
    .find()
    .sort({ sold: -1 })
    .limit(4)
    .toArray();
  res.render("user/home.ejs", { user, newProduct, recommendProduct });
});

router.get("/products", (req, res) => {
  const db = req.db;
  user = req.session.user ? req.session.user : null;
  db.collection("products")
    .find()
    .toArray()
    .then((products) => res.render("user/products.ejs", { products, user }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/products/search", (req, res) => {
  const db = req.db;
  const query = req.query.nama;
  const searchQuery = { nama: { $regex: new RegExp(query, "i") } };

  db.collection("products")
    .find(searchQuery)
    .toArray()
    .then((products) => res.render("user/products.ejs", { products }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.redirect("/login");
  });
});

module.exports = router;
