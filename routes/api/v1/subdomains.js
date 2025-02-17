const express = require("express");
const subdomainRouter = express.Router();

subdomainRouter.use("/:subdomain", (req, res, next) => {
  const subdomain = req.params.subdomain;
  console.log(`Subdomein gebruikt: ${subdomain}`);
  // Voeg hier je logica toe om te reageren op het subdomein
  res.send(`Subdomein ${subdomain} is actief`);
});

app.use(subdomainRouter);
