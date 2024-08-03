const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Set lokasi static files
app.use(express.static(path.join(__dirname, "assets")));

// Koneksi MongoDB
let db;
MongoClient.connect("mongodb://localhost:27017", {
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
app.get("/registrasi", (req, res) => res.render("registrasi.ejs"));

// Admin
app.get("/admin", (req, res) => res.render("admin/login.ejs"));
app.get("/admin/dashboard", (req, res) => res.render("admin/dashboard.ejs"));
app.get("/admin/useraccess", (req, res) => res.render("admin/useraccess.ejs"));

// PRODUCTS PAGES
app.get("/admin/products", (req, res) =>
  db
    .collection("products")
    .find()
    .toArray()
    .then((products) => res.render("admin/products.ejs", { products }))
    .catch((err) => res.status(500).json({ error: err.message }))
);
app.get("/admin/products/add", (req, res) =>
  res.render("admin/addproduct.ejs")
);

// Tambah Product
app.post("/admin/products/add", (req, res) => {
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
app.get("/admin/products/update/:id", (req, res) => {
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

app.post("/admin/products/update/:id", (req, res) => {
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

// Start server
const PORT = 8090;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
