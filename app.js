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
const connection = config.get("mongodb");

// Verbinden met MongoDB
mongoose
  .connect(connection)
  .then(() => console.log("MongoDB verbonden"))
  .catch((err) => console.error("MongoDB verbindingsfout:", err));

// Middleware om subdomeinen te detecteren
app.use((req, res, next) => {
  const host = req.headers.host; // Bijvoorbeeld: odettelunettes.rebilt.be
  const subdomain = host.split(".")[0]; // "odettelunettes"

  // Check of het subdomein een partner is
  PartnerModel.findOne({ domain: subdomain })
    .then((partner) => {
      if (partner) {
        req.partner = partner; // Bewaar partnerinfo in request
      }
      next();
    })
    .catch((err) => {
      console.error("Fout bij ophalen van partner:", err);
      next();
    });
});

// CORS middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://192.168.0.130:5173",
    "http://172.20.144.1:5173",
    "https://platform.rebilt.be",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Standaard middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

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

app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/configurations", configurationRouter);
app.use("/api/v1/partnerConfigurations", partnerConfigurationRouter);
app.use("/api/v1/options", optionRouter);
app.use("/api/v1/checkouts", checkoutRouter);

// Vue frontend laten werken met history mode
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling (404 na Vue-frontend)
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// Start de server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server draait op poort ${PORT}`);
});

module.exports = app;
