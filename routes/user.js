const express = require("express");
const { ObjectId } = require("mongodb");

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
        return res.render("login.ejs", { error: "User not found" });
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
    .then(() => res.redirect("/login"))
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

router.get("/detail-product/:id", (req, res) => {
  const db = req.db;
  const productId = req.params.id;
  user = req.session.user ? req.session.user : null;

  db.collection("products")
    .findOne({ _id: new ObjectId(productId) })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.render("user/detail.ejs", { product, user });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Transactions
router.post("/transactions", async (req, res) => {
  const db = req.db;
  const newTrans = {
    date: Date.now(),
    idPembeli: req.body.idPembeli,
    idProduct: req.body.idProduct,
    jumlah: parseInt(req.body.jumlah),
    total: parseInt(req.body.total),
  };

  await db
    .collection("products")
    .updateOne(
      { _id: new ObjectId(req.body.idProduct) },
      { $inc: { sold: 1 } }
    );

  db.collection("transactions")
    .insertOne(newTrans)
    .then(() => res.redirect("/products"))
    .catch((err) => {
      console.error("Error: " + err);
      res.status(500).send("Transaction addition failed");
    });
});

// Profile
router.get("/profile", async (req, res) => {
  const db = req.db;
  user = req.session.user ? req.session.user : null;
  idPembeli = null;
  if (user && user._id) {
    idPembeli = user._id;
  } else {
    idPembeli = 0;
  }
  let transactions = await db
    .collection("transactions")
    .find({ idPembeli: idPembeli })
    .toArray();
  res.render("user/profile.ejs", { user, transactions });
});

router.get("/profile/update", async (req, res) => {
  const db = req.db;
  user = req.session.user ? req.session.user : null;
  res.render("user/updateprofile.ejs", { user });
});

router.post("/profile/delete", (req, res) => {
  const db = req.db;
  const id = req.body.id;

  db.collection("users")
    .deleteOne({ _id: new ObjectId(id) })
    .then(() => res.redirect("/login"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.post("/profile/update/:id", (req, res) => {
  const db = req.db;
  const userId = req.params.id;

  const updateUser = {
    username: req.body.username,
    email: req.body.email,
  };

  db.collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: updateUser })
    .then(() => res.redirect("/profile"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// History
router.get("/history", async (req, res) => {
  const db = req.db;
  user = req.session.user ? req.session.user : null;
  idPembeli = null;
  if (user && user._id) {
    idPembeli = user._id;
  } else {
    idPembeli = 0;
  }

  let transactions = await db
    .collection("transactions")
    .find({ idPembeli: idPembeli })
    .toArray();
  for (let transaction of transactions) {
    let product = await db
      .collection("products")
      .findOne(
        { _id: new ObjectId(transaction.idProduct) },
        { projection: { nama: 1, hargaEceran: 1 } }
      );

    transaction.namaProduk = product ? product.nama : "Produk";
    transaction.hargaProduk = product ? product.hargaEceran : 0;
  }
  res.render("user/history.ejs", { user, transactions });
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
