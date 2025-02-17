const express = require("express");
const router = express.Router();
const PartnerModel = require("../../../models/api/v1/Partner"); // Zorg ervoor dat het model correct is geïmporteerd

// Route om partnergegevens op basis van subdomein op te halen
router.get("/", async (req, res) => {
  try {
    // Verkrijg het subdomein van de host
    const host = req.headers.host;
    const subdomain = host.split(".")[0]; // Het subdomein zonder .reblit.be

    console.log("Subdomein gedetecteerd:", subdomain);

    // Zoek de partner in de database op basis van het domein
    const partner = await PartnerModel.findOne({ domain: `${subdomain}.be` });

    if (partner) {
      // Stuur de partner gegevens terug als JSON
      return res.json({
        status: "success",
        message: "Partner gevonden",
        data: {
          partner: partner,
        },
      });
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "Partner niet gevonden" });
    }
  } catch (error) {
    console.error("Fout bij het ophalen van partner:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Interne serverfout" });
  }
});

module.exports = router;
