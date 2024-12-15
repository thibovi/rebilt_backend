const HouseStyle = require("../../../models/api/v1/HouseStyle");

module.exports = {
  // CREATE: Maak een nieuwe huisstijl aan
  async create(req, res) {
    try {
      const {
        userId,
        primary_color,
        secondary_color,
        text_color,
        titles_color,
        background_color,
        fontFamilyBodyText,
        fontFamilyTitles,
        logo_url, // Added new fields
      } = req.body;

      // Controleer of alle vereiste velden aanwezig zijn
      if (
        !userId ||
        !primary_color ||
        !secondary_color ||
        !text_color ||
        !titles_color ||
        !background_color ||
        !fontFamilyBodyText ||
        !fontFamilyTitles
      ) {
        return res.status(400).json({ message: "Alle velden zijn verplicht" });
      }

      // Maak een nieuwe huisstijl aan
      const newHouseStyle = new HouseStyle({
        userId,
        primary_color,
        secondary_color,
        text_color,
        titles_color,
        background_color,
        fontFamilyBodyText,
        fontFamilyTitles,
        logo_url, // Added new field
      });

      // Sla de huisstijl op in de database
      await newHouseStyle.save();
      return res.status(201).json({
        message: "HouseStyle succesvol aangemaakt!",
        houseStyle: newHouseStyle,
      });
    } catch (error) {
      console.error("Fout bij het aanmaken van huisstijl:", error);
      return res.status(500).json({
        message: "Fout bij het aanmaken van huisstijl.",
        error: error.message,
      });
    }
  },

  // INDEX: Haal alle huisstijlen op
  async index(req, res) {
    try {
      // Haal alle huisstijlen op
      const houseStyles = await HouseStyle.find();
      return res.status(200).json(houseStyles);
    } catch (error) {
      console.error("Fout bij het ophalen van huisstijlen:", error);
      return res.status(500).json({
        message: "Fout bij het ophalen van huisstijlen.",
        error: error.message,
      });
    }
  },

  // SHOW: Haal een specifieke huisstijl op basis van userId
  async show(req, res) {
    const { userId } = req.params;

    try {
      // Zoek de huisstijl op basis van userId
      const houseStyle = await HouseStyle.findOne({ userId });

      if (!houseStyle) {
        return res.status(404).json({
          message: `Huisstijl niet gevonden voor gebruiker met ID ${userId}`,
        });
      }

      return res.status(200).json(houseStyle);
    } catch (error) {
      console.error("Fout bij het ophalen van huisstijl:", error);
      return res.status(500).json({
        message: "Fout bij het ophalen van huisstijl.",
        error: error.message,
      });
    }
  },

  // UPDATE: Werk een specifieke huisstijl bij op basis van userId
  async update(req, res) {
    const { userId } = req.params;
    const {
      primary_color,
      secondary_color,
      text_color,
      titles_color,
      background_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url, // Added new fields
    } = req.body;

    console.log("Update ontvangen voor userId:", userId);
    console.log("Gegevens ontvangen:", {
      primary_color,
      secondary_color,
      text_color,
      titles_color,
      background_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url, // New field added to logging
    });

    try {
      // Zoek de huisstijl op basis van userId
      const houseStyle = await HouseStyle.findOne({ userId });

      if (!houseStyle) {
        return res.status(404).json({
          message: `Huisstijl niet gevonden voor gebruiker met ID ${userId}`,
        });
      }

      // Werk de huisstijl bij
      houseStyle.primary_color = primary_color || houseStyle.primary_color;
      houseStyle.secondary_color =
        secondary_color || houseStyle.secondary_color;
      houseStyle.text_color = text_color || houseStyle.text_color;
      houseStyle.titles_color = titles_color || houseStyle.titles_color;
      houseStyle.background_color =
        background_color || houseStyle.background_color;
      houseStyle.fontFamilyBodyText =
        fontFamilyBodyText || houseStyle.fontFamilyBodyText;
      houseStyle.fontFamilyTitles =
        fontFamilyTitles || houseStyle.fontFamilyTitles;
      houseStyle.logo_url = logo_url || houseStyle.logo_url; // Update logo_url

      // Sla de geüpdate huisstijl op
      await houseStyle.save();
      return res.status(200).json({
        message: "Huisstijl succesvol bijgewerkt!",
        houseStyle,
      });
    } catch (error) {
      console.error("Fout bij het bijwerken van huisstijl:", error);
      return res.status(500).json({
        message: "Fout bij het bijwerken van huisstijl.",
        error: error.message,
      });
    }
  },

  // DESTROY: Verwijder een specifieke huisstijl op basis van userId
  async destroy(req, res) {
    const { userId } = req.params;

    try {
      // Verwijder de huisstijl op basis van userId
      const result = await HouseStyle.deleteOne({ userId });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: `Huisstijl niet gevonden voor gebruiker met ID ${userId}`,
        });
      }

      return res.status(200).json({
        message: "Huisstijl succesvol verwijderd",
      });
    } catch (error) {
      console.error("Fout bij het verwijderen van huisstijl:", error);
      return res.status(500).json({
        message: "Fout bij het verwijderen van huisstijl.",
        error: error.message,
      });
    }
  },
};
