const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const config = require("config");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Poort instellen
const PORT = process.env.PORT || 3000;

// Configuratie op basis van de poort
let connection;
if (PORT == 3000) {
  // Gebruik "==" zodat het werkt voor zowel string als number
  connection = config.get("mongodb"); // default.json voor lokale ontwikkeling
} else {
  connection = config.get("mongodb"); // production.json voor productie
}

// Verbinden met MongoDB
mongoose
  .connect(connection)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routers
const partnerRouter = require("./routes/api/v1/partners");
const userRouter = require("./routes/api/v1/users");
const productRouter = require("./routes/api/v1/products");
const houseStyleRouter = require("./routes/api/v1/houseStyle");
const orderRouter = require("./routes/api/v1/orders");

// View engine instellen
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API-routes
app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/houseStyle", houseStyleRouter);
app.use("/api/v1/orders", orderRouter);

// Foutafhandeling voor 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Algemene foutafhandeling
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
