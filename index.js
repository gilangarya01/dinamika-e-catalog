const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const session = require("express-session");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Set lokasi static files
app.use(express.static(path.join(__dirname, "assets")));

// Konfigurasi session
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 60 }, // Session berlaku selama 1 jam
  })
);

// Middleware untuk mengecek apakah user sudah login
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect("/admin");
  }
}

// Koneksi MongoDB
let db;
MongoClient.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db("uas-204160");
  })
  .catch((error) => {
    console.error("Connection error", error);
  });

// User
app.get("/", (req, res) => res.render("login.ejs"));

// Registrasi
app.get("/registrasi", (req, res) => res.render("registrasi.ejs"));

app.post("/registrasi", (req, res) => {
  // Check password and repassword sama
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

app.get("/home", (req, res) => res.render("user/home.ejs"));
app.get("/products", (req, res) => res.render("user/products.ejs"));

// Admin
app.get("/admin", (req, res) => res.render("admin/login.ejs"));

// Login
app.post("/admin", (req, res) => {
  let name = req.body.username;
  const query = {
    username: name,
    password: req.body.password,
    level: 0,
  };
  db.collection("users")
    .findOne(query)
    .then((user) => {
      if (!user) {
        return res.render("admin/login.ejs", { error: "User not found" });
      }
      // Simpan informasi user di session
      req.session.user = user;
      res.redirect("/admin/dashboard");
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Halaman yang dilindungi oleh autentikasi
app.get("/admin/dashboard", isAuthenticated, async (req, res) => {
  let countUser;
  const userCount = await db.collection("users").countDocuments();
  const productCount = await db.collection("products").countDocuments();
  res.render("admin/dashboard.ejs", { userCount, productCount });
});

app.get("/admin/useraccess", isAuthenticated, (req, res) =>
  db
    .collection("users")
    .find({ level: 0 })
    .toArray()
    .then((users) => res.render("admin/useraccess.ejs", { users }))
    .catch((err) => res.status(500).json({ error: err.message }))
);

app.get("/admin/useraccess/user", isAuthenticated, (req, res) =>
  db
    .collection("users")
    .find({ level: 1 })
    .toArray()
    .then((users) => res.render("admin/userlist.ejs", { users }))
    .catch((err) => res.status(500).json({ error: err.message }))
);

// Search User
app.get("/admin/useraccess/user/search", isAuthenticated, (req, res) => {
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

// To Admin
app.post("/admin/useraccess/toadmin", isAuthenticated, (req, res) => {
  const userId = req.body.id;
  const updateLevel = {
    level: 0,
  };
  db.collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: updateLevel })
    .then(() => res.redirect("/admin/useraccess"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Remove Admin
app.post("/admin/useraccess/remove", isAuthenticated, (req, res) => {
  const userId = req.body.id;
  const updateLevel = {
    level: 1,
  };
  db.collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: updateLevel })
    .then(() => res.redirect("/admin/useraccess"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// PRODUCTS PAGES
app.get("/admin/products", isAuthenticated, (req, res) =>
  db
    .collection("products")
    .find()
    .toArray()
    .then((products) => res.render("admin/products.ejs", { products }))
    .catch((err) => res.status(500).json({ error: err.message }))
);
app.get("/admin/products/add", isAuthenticated, (req, res) =>
  res.render("admin/addproduct.ejs")
);

// Search Products
app.get("/admin/products/search", isAuthenticated, (req, res) => {
  const query = req.query.nama;
  const searchQuery = {
    nama: { $regex: new RegExp(query, "i") },
  };

  db.collection("products")
    .find(searchQuery)
    .toArray()
    .then((products) => res.render("admin/products.ejs", { products }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Tambah Product
app.post("/admin/products/add", isAuthenticated, (req, res) => {
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

// Update Product
app.get("/admin/products/update/:id", isAuthenticated, (req, res) => {
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

app.post("/admin/products/update/:id", isAuthenticated, (req, res) => {
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

// Hapus Product
app.post("/admin/products/delete", isAuthenticated, (req, res) => {
  const productId = req.body.idProduct;
  db.collection("products")
    .deleteOne({ _id: new ObjectId(productId) })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.redirect("/admin");
  });
});

// Start server
const PORT = 8090;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
