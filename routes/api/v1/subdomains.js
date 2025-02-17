const express = require("express");
const router = express.Router();

// Subdomein specifieke route
router.get("/", (req, res) => {
  if (!req.partner) {
    return res.status(404).send("Subdomein niet gevonden");
  }

  // Render een dynamische HTML-pagina met partnergegevens
  res.send(`
    <html>
      <head>
        <title>${req.partner.name}</title>
        <style>
          body {
            background-color: ${req.partner.background_color};
            color: ${req.partner.text_color};
            font-family: ${req.partner.fontFamilyBodyText};
          }
          h1 {
            color: ${req.partner.titles_color};
          }
          .logo {
            width: 100px;
          }
        </style>
      </head>
      <body>
        <img class="logo" src="${req.partner.logo_url}" alt="${req.partner.name} Logo" />
        <h1>Welkom bij ${req.partner.name}</h1>
        <p>Adres: ${req.partner.address.street}, ${req.partner.address.city}</p>
        <p>Contact: ${req.partner.contact_email} | ${req.partner.contact_phone}</p>
      </body>
    </html>
  `);
});

module.exports = router;
