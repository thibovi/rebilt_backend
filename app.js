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
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Use CORS middleware before routes
app.use(cors(corsOptions));

// Ensure OPTIONS requests are handled
app.options("*", cors(corsOptions)); // Handle preflight requests

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // Zorg ervoor dat je statische bestanden goed zijn geconfigureerd

// Definieer de routes
app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/configurations", configurationRouter);
app.use("/api/v1/partnerConfigurations", partnerConfigurationRouter);
app.use("/api/v1/options", optionRouter);
app.use("/api/v1/checkouts", checkoutRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.use(async (req, res, next) => {
  const host = req.headers.host; // bv. "odettelunettes.rebilt.be"
  const subdomain = host.split(".")[0]; // "odettelunettes"

  // Controleer of het een geldig subdomein is (uitsluiten van 'www' en hoofddomein)
  if (subdomain !== "rebilt" && subdomain !== "www") {
    const Partner = require("./models/api/v1/Partner"); // Zorg dat je Partner model bestaat

    try {
      const partner = await Partner.findOne({ subdomain });
      if (!partner) {
        return res.status(404).send("Subdomein niet gevonden");
      }

      req.partner = partner; // Opslaan van partnergegevens voor later gebruik
    } catch (error) {
      console.error("Fout bij ophalen partner:", error);
      return res.status(500).send("Interne serverfout");
    }
  }

  next();
});

// Luister op '0.0.0.0' om verbindingen van andere apparaten op je netwerk toe te staan
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
