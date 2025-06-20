const express = require("express");
const PartnerModel = require("./models/api/v1/Partner");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const createError = require("http-errors");
const config = require("config");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB verbinden
const connection = config.get("mongodb");
mongoose
  .connect(connection)
  .then(() => console.log("✅ MongoDB verbonden"))
  .catch((err) => console.error("❌ MongoDB verbindingsfout:", err));

// ✅ CORS-instellingen
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://192.168.0.130:5173",
      "http://172.20.144.1:5173",
      "https://rebilt.be",
      "https://platform.rebilt.be",
      "https://rebilt-backend.onrender.com",
    ];
    const rebiltSubdomainRegex = /^https?:\/\/([a-z0-9-]+\.)?rebilt\.be$/;
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      rebiltSubdomainRegex.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Niet toegestane CORS-origin"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // PATCH toegevoegd!
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ✅ CORS middleware voor alle routes
app.use(cors(corsOptions));

// ✅ Middleware voor preflight requests (OPTIONS)
app.options("*", cors(corsOptions)); // Preflight requests correct afhandelen

// ✅ Middleware voor expliciete CORS headers voor image analysis route
app.use("/api/v1/imageanalysis", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://platform.rebilt.be");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ Standaard middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Routers importeren
const userRouter = require("./routes/api/v1/users");
const productRouter = require("./routes/api/v1/products");
const orderRouter = require("./routes/api/v1/orders");
const orderPaymentRouter = require("./routes/api/v1/orderPayment");
const categoryRouter = require("./routes/api/v1/categories");
const filterRouter = require("./routes/api/v1/filters");
const partnerRouter = require("./routes/api/v1/partners");
const configurationRouter = require("./routes/api/v1/configurations");
const partnerConfigurationRouter = require("./routes/api/v1/partnerConfigurations");
const optionRouter = require("./routes/api/v1/options");
const checkoutRouter = require("./routes/api/v1/checkouts");
const imageAnalysisRouter = require("./routes/api/v1/imageAnalysis");
const modelRoutes = require("./routes/api/v1/modelRoutes");
const cloudinaryRoutes = require("./routes/api/v1/cloudinary");
const uploadRouter = require("./routes/api/v1/upload");

app.use("/models", express.static(path.join(__dirname, "models")));

// ✅ API-routes instellen
app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/orderPayment", orderPaymentRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/filters", filterRouter);
app.use("/api/v1/configurations", configurationRouter);
app.use("/api/v1/partnerConfigurations", partnerConfigurationRouter);
app.use("/api/v1/options", optionRouter);
app.use("/api/v1/checkouts", checkoutRouter);
app.use("/api/v1/models", modelRoutes);
app.use("/api/v1/cloudinary", cloudinaryRoutes);
app.use("/api/v1/upload", uploadRouter);

app.use(
  "/api/v1/imageanalysis",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://platform.rebilt.be");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  },
  imageAnalysisRouter
);

// ✅ Vue frontend laten werken met history mode
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ Fallback 404 error
app.use((req, res, next) => {
  next(createError(404));
});

// ✅ Algemene error-handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// ✅ Server starten
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server draait op poort ${PORT}`);
});

module.exports = app;
