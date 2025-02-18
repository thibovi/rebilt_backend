const express = require("express");
const PartnerModel = require("./models/api/v1/Partner");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const createError = require("http-errors");
const config = require("config");
const cors = require("cors");

const app = express();

// Poort instellen
const PORT = process.env.PORT || 3000;

// MongoDB configuratie
let connection;
if (PORT == 3000) {
  connection = config.get("mongodb"); // Standaard config voor lokale ontwikkeling
} else {
  connection = config.get("mongodb"); // Config voor productie
}

// Verbinden met MongoDB
mongoose
  .connect(connection)
  .then(() => console.log("MongoDB verbonden"))
  .catch((err) => console.error("MongoDB verbindingsfout:", err));

// Routers
const userRouter = require("./routes/api/v1/users");
const productRouter = require("./routes/api/v1/products");
const orderRouter = require("./routes/api/v1/orders");
const categoryRouter = require("./routes/api/v1/categories");
const partnerRouter = require("./routes/api/v1/partners");
const configurationRouter = require("./routes/api/v1/configurations");
const partnerConfigurationRouter = require("./routes/api/v1/partnerConfigurations");
const optionRouter = require("./routes/api/v1/options");
const checkoutRouter = require("./routes/api/v1/checkouts");

// View engine instellen
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// CORS middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://192.168.0.130:5173",
    "http://172.20.144.1:5173/",
    "https://platform.rebilt.be", // Ensure this is added
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Gebruik CORS middleware voor routes
app.use(cors(corsOptions));

// Zorg ervoor dat je preflight requests (OPTIONS) goed behandelt
app.options("*", cors(corsOptions));

// Standaard middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

// Gebruik de routers
app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/configurations", configurationRouter);
app.use("/api/v1/partnerConfigurations", partnerConfigurationRouter);
app.use("/api/v1/options", optionRouter);
app.use("/api/v1/checkouts", checkoutRouter);

// Error handling
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start de server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server draait op poort ${PORT}`);
});

module.exports = app;
