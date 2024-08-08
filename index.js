const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const { connectToDB } = require("./config/db");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "assets")));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 60 },
  })
);

// Database connection
connectToDB().then((db) => {
  // Pass the db to the routes
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Routes
  app.use("/", userRoutes);
  app.use("/admin", adminRoutes);

  // Start server
  const PORT = 8090;
  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
});
