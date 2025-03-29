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

// CORS middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://192.168.0.130:5173",
    "http://172.20.144.1:5173",
    "https://platform.rebilt.be",
    "http://odettelunettes.rebilt.be/",
    "https://odettelunettes.rebilt.be/",
    "https://rebilt-backend.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

require("dotenv").config();

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Standaard middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

// Middleware om subdomeinen te detecteren
app.use((req, res, next) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const subdomain = host.split(".")[0]; // Dit haalt het subdomein uit de hostnaam

  // Log het subdomein elke keer dat er een verzoek komt
  console.log(`Er wordt geprobeerd te surfen naar subdomein: ${subdomain}`);

  // Zoeken naar het partnerdomein in de database
  PartnerModel.findOne({ domain: subdomain })
    .then((partner) => {
      if (partner) {
        console.log(
          `Partner gevonden voor subdomein ${subdomain}: ${partner.domain}`
        );
        req.partner = partner; // Bewaar partnerinformatie in de request
      } else {
        console.log(`Geen partner gevonden voor subdomein: ${subdomain}`);
      }
      next(); // Ga door naar de volgende middleware
    })
    .catch((err) => {
      console.error("Fout bij ophalen van partner:", err);
      next(); // Ga verder met de request, ook al is er een fout
    });
});

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
const imageAnalysisRouter = require("./routes/api/v1/imageAnalysis");

app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/configurations", configurationRouter);
app.use("/api/v1/partnerConfigurations", partnerConfigurationRouter);
app.use("/api/v1/options", optionRouter);
app.use("/api/v1/checkouts", checkoutRouter);
app.use("/api/v1/imageAnalysis", imageAnalysisRouter);

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
