const express = require("express");
const { ObjectId } = require("mongodb");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.get("/", (req, res) => res.render("admin/login.ejs"));

router.post("/", (req, res) => {
  const db = req.db;
  const query = {
    username: req.body.username,
    password: req.body.password,
    level: 0,
  };

  db.collection("users")
    .findOne(query)
    .then((user) => {
      if (!user) {
        return res.render("admin/login.ejs", { error: "User not found" });
      }
      req.session.user = user;
      res.redirect("/admin/dashboard");
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/dashboard", isAuthenticated, async (req, res) => {
  const db = req.db;
  const userCount = await db.collection("users").countDocuments();
  const productCount = await db.collection("products").countDocuments();
  res.render("admin/dashboard.ejs", { userCount, productCount });
});

router.get("/useraccess", isAuthenticated, (req, res) => {
  const db = req.db;
  db.collection("users")
    .find({ level: 0 })
    .toArray()
    .then((users) => res.render("admin/useraccess.ejs", { users }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/useraccess/user", isAuthenticated, (req, res) => {
  const db = req.db;
  db.collection("users")
    .find({ level: 1 })
    .toArray()
    .then((users) => res.render("admin/userlist.ejs", { users }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/useraccess/user/search", isAuthenticated, (req, res) => {
  const db = req.db;
  const query = req.query.nama;
  const searchQuery = {
    username: { $regex: new RegExp(query, "i") },
    level: 1,
  };

  db.collection("users")
    .find(searchQuery)
    .toArray()
    .then((users) => res.render("admin/userlist.ejs", { users }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.post("/useraccess/toadmin", isAuthenticated, (req, res) => {
  const db = req.db;
  const userId = req.body.id;
  const updateLevel = { level: 0 };

  db.collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: updateLevel })
    .then(() => res.redirect("/admin/useraccess"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.post("/useraccess/remove", isAuthenticated, (req, res) => {
  const db = req.db;
  const userId = req.body.id;
  const updateLevel = { level: 1 };

  db.collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: updateLevel })
    .then(() => res.redirect("/admin/useraccess"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/products", isAuthenticated, (req, res) => {
  const db = req.db;
  db.collection("products")
    .find()
    .toArray()
    .then((products) => res.render("admin/products.ejs", { products }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/products/add", isAuthenticated, (req, res) =>
  res.render("admin/addproduct.ejs")
);

router.get("/products/search", isAuthenticated, (req, res) => {
  const db = req.db;
  const query = req.query.nama;
  const searchQuery = { nama: { $regex: new RegExp(query, "i") } };

  db.collection("products")
    .find(searchQuery)
    .toArray()
    .then((products) => res.render("admin/products.ejs", { products }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.post("/products/add", isAuthenticated, (req, res) => {
  const db = req.db;
  const newProduct = {
    nama: req.body.nama,
    deskripsi: req.body.deskripsi,
    hargaEceran: parseInt(req.body.hargaEceran),
    hargaGrosir: parseInt(req.body.hargaGrosir),
    satuan: `${req.body.satuan} ${req.body.massa}`,
    stok: parseInt(req.body.stok),
  };

  db.collection("products")
    .insertOne(newProduct)
    .then(() => res.redirect("/admin/products"))
    .catch((err) => {
      console.error("Error: " + err);
      res.status(500).send("Product addition failed");
    });
});

router.get("/products/update/:id", isAuthenticated, (req, res) => {
  const db = req.db;
  const productId = req.params.id;

  db.collection("products")
    .findOne({ _id: new ObjectId(productId) })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.render("admin/updateproduct.ejs", { product });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.post("/products/update/:id", isAuthenticated, (req, res) => {
  const db = req.db;
  const productId = req.params.id;
  const updateProduct = {
    nama: req.body.nama,
    deskripsi: req.body.deskripsi,
    hargaEceran: parseInt(req.body.hargaEceran),
    hargaGrosir: parseInt(req.body.hargaGrosir),
    satuan: `${req.body.satuan} ${req.body.massa}`,
    stok: parseInt(req.body.stok),
  };

  db.collection("products")
    .updateOne({ _id: new ObjectId(productId) }, { $set: updateProduct })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.post("/products/delete", isAuthenticated, (req, res) => {
  const db = req.db;
  const productId = req.body.idProduct;

  db.collection("products")
    .deleteOne({ _id: new ObjectId(productId) })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.redirect("/admin");
  });
});

module.exports = router;
