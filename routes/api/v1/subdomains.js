const express = require("express");
const subdomainRouter = express.Router();

subdomainRouter.use("/:subdomain", (req, res, next) => {
  const subdomain = req.params.subdomain;
  console.log(`Subdomein gebruikt: ${subdomain}`);

  // Voeg hier de logica toe om het subdomein te verwerken
  if (subdomain === "odettelunettes") {
    return res.send("Subdomein 'odettelunettes' is actief");
  }

  // Verwerk andere subdomeinen, bijvoorbeeld:
  res.send(`Subdomein ${subdomain} is actief`);
});

app.use(subdomainRouter);
