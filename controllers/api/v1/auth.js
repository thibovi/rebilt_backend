const jwt = require("jsonwebtoken");
const User = require("../../../models/api/v1/User");
const Partner = require("../../../models/api/v1/Partner");
const nodemailer = require("nodemailer");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role,
      company, // Dit gebruiken we om de partner te vinden, optioneel
      activeInactive,
      country,
      city,
      postalCode,
      profileImage,
      bio,
    } = req.body.user;

    // Validatie van verplichte velden
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !role ||
      !activeInactive
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Controleer of het e-mailadres al bestaat
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Zoek het partner ID (companyId) op basis van de company naam
    // We doen dit alleen als company is ingevuld
    let partnerId = null;
    if (company) {
      const partner = await Partner.findOne({ name: company });
      if (!partner) {
        return res
          .status(404)
          .json({ message: `Company "${company}" not found.` });
      }
      partnerId = partner._id; // Koppel de partnerId aan de gebruiker
    }

    // Maak een nieuwe gebruiker aan met optionele velden
    const user = new User({
      firstname,
      lastname,
      email,
      role,
      activeInactive,
      company, // Optioneel om te bewaren voor de leesbaarheid
      partnerId, // Koppel de partnerId aan de gebruiker (kan null zijn)
      country,
      city,
      postalCode,
      profileImage,
      bio,
      createdAt: new Date(),
      lastUpdated: new Date(),
    });

    // Gebruik Passport om het wachtwoord te hashen en de gebruiker te registreren
    await User.register(user, password);

    // Genereer een JWT-token inclusief partnerId als het aanwezig is
    const expiresIn = 3600; // 1 uur (in seconden)
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;

    const token = jwt.sign(
      {
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        companyId: partnerId, // Partner ID toevoegen aan token (kan null zijn)
        exp: expirationTime, // Expliciete vervaltijd
      },
      "MyVerySecretWord"
    );

    // Response met gebruikersinformatie en token
    res.status(201).json({
      status: "success",
      data: {
        token: token,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          company: user.company, // Handig voor leesbaarheid
          activeInactive: user.activeInactive,
          country: user.country,
          city: user.city,
          postalCode: user.postalCode,
          profileImage: user.profileImage,
          bio: user.bio,
        },
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ message: "An error occurred during signup. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Email and password are required",
      });
    }

    // Authenticate user
    const authResult = await User.authenticate()(email, password);
    const user = authResult.user;

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid email or password",
      });
    }

    // Handle user.company (may be null)
    let companyId = null;

    if (user.company) {
      const partner = await Partner.findOne({ name: user.company });

      if (!partner) {
        return res.status(400).json({
          status: "failed",
          message: `Partner with name '${user.company}' not found`,
        });
      }

      companyId = partner._id; // Partner found, assign companyId
    }

    // Generate JWT token
    const expiresIn = 3600; // 1 hour (in seconds)
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;

    const token = jwt.sign(
      {
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        companyId: companyId, // Use companyId here instead of partnerId
        exp: expirationTime, // Explicit expiration time
      },
      "MyVerySecretWord"
    );

    return res.json({
      status: "success",
      data: {
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during login. Please try again.",
    });
  }
};

const index = async (req, res) => {
  try {
    // Haal alle gebruikers op
    const users = await User.find();

    // Voeg partnerId toe aan elke gebruiker door de company te matchen met Partner
    const usersWithPartnerId = await Promise.all(
      users.map(async (user) => {
        const partner = await Partner.findOne({ name: user.company });
        return {
          ...user._doc,
          partnerId: partner ? partner._id : null, // PartnerId toevoegen of null als niet gevonden
        };
      })
    );

    res.json({
      status: "success",
      data: {
        users: usersWithPartnerId,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve users",
      error: err.message || err,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params; // Haal de ID uit de requestparameters

    const user = await User.findById(id); // Zoek de gebruiker op basis van de ID

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Zoek de bijbehorende partner op
    const partner = await Partner.findOne({ name: user.company });

    res.json({
      status: "success",
      data: {
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          id: user._id,
          role: user.role,
          company: user.company,
          partnerId: partner ? partner._id : null, // PartnerId toevoegen of null als niet gevonden
          activeInactive: user.activeInactive,
          country: user.country,
          city: user.city,
          postalCode: user.postalCode,
          profileImage: user.profileImage,
          bio: user.bio,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "An error occurred while fetching user.",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  const userData = req.body.user;
  const { id } = req.params;

  if (!userData) {
    return res.status(400).json({
      status: "error",
      message: "User data is required for update",
    });
  }

  try {
    // Controleer of de gebruiker bestaat
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Werk de gebruiker bij met de nieuwe gegevens en update lastUpdated
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          ...userData,
          lastUpdated: new Date(), // Update lastUpdated naar de huidige tijd
        },
      },
      { new: true, runValidators: true } // `new: true` retourneert de bijgewerkte gebruiker
    );

    res.json({
      status: "success",
      data: {
        user: {
          firstname: updatedUser.firstname,
          lastname: updatedUser.lastname,
          email: updatedUser.email,
          id: updatedUser._id,
          company: updatedUser.company,
          activeInactive: updatedUser.activeInactive,
          country: updatedUser.country,
          city: updatedUser.city,
          postalCode: updatedUser.postalCode,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
          lastUpdated: updatedUser.lastUpdated, // Voeg lastUpdated toe aan de response
        },
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: "error",
      message: "User could not be updated",
      error: err.message || err,
    });
  }
};

const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "E-mail is verplicht." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    user.resetCode = verificationCode;
    user.resetCodeExpiration = Date.now() + 3600000; // 1 uur geldig
    await user.save();

    console.log(process.env.COMBELL_EMAIL);
    console.log(process.env.COMBELL_PASSWORD);

    const transporter = nodemailer.createTransport({
      host: "smtp-auth.mailprotect.be",
      port: 587,
      secure: false,
      auth: {
        user: process.env.COMBELL_EMAIL,
        pass: process.env.COMBELL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.COMBELL_EMAIL,
      to: user.email,
      subject: "Wachtwoord reset verificatiecode",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #9747ff; text-align: center;">Wachtwoord reset verificatie</h2>
          <p style="color: #000;">Hallo ${user.firstname},</p>
          <p style="color: #000;">Je hebt een verzoek ingediend om je wachtwoord opnieuw in te stellen. Gebruik de volgende code om je wachtwoord te resetten:</p>
          <div style="font-size: 24px; font-weight: bold; color: #9747ff; text-align: center; padding: 15px; border: 1px solid #9747ff; border-radius: 8px; background-color: #f0f8ff;">
            ${verificationCode}
          </div>
          <p style="color: #000;">Bedankt,<br>Het Support Team</p>
          <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} rebilt. Alle rechten voorbehouden.
          </footer>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Verificatiecode verzonden" });
  } catch (error) {
    console.error("Fout bij wachtwoord reset:", error);

    // Specifieke fout voor ontbrekende inloggegevens
    if (error.code === "EAUTH") {
      return res.status(500).json({
        message: "E-mailconfiguratie is fout, controleer je SMTP-instellingen.",
        error: error.message,
      });
    }

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden." });
    }

    console.log("Gebruiker gevonden:", user);

    if (!user.resetCode) {
      return res
        .status(400)
        .json({ message: "Geen verificatiecode gevonden." });
    }

    if (user.resetCodeExpiration < Date.now()) {
      return res
        .status(400)
        .json({ message: "De verificatiecode is verlopen." });
    }

    if (code !== user.resetCode.toString()) {
      return res.status(400).json({ message: "Ongeldige verificatiecode." });
    }

    const newToken = jwt.sign(
      {
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        company: user.company,
      },
      "MyVerySecretWord",
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ message: "Verificatiecode is correct.", token: newToken });
  } catch (error) {
    console.error("Fout bij het verifiëren van de code:", error.message);
    return res.status(500).json({ message: "Er is een fout opgetreden." });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hier is de controle voor de verificatiecode verwijderd.
    if (!user.resetCode) {
      return res.status(400).json({ message: "No verification code found." });
    }

    // Controleer of de verificatiecode is verlopen
    if (user.resetCodeExpiration < Date.now()) {
      return res
        .status(400)
        .json({ message: "The verification code has expired." });
    }

    // Dit is de controle voor de verificatiecode verwijderd.
    // if (code !== user.resetCode.toString()) {
    //   return res.status(400).json({ message: "Invalid verification code." });
    // }

    // Stel het nieuwe wachtwoord in
    await user.setPassword(newPassword);
    user.resetCode = undefined; // Reset de verificatiecode
    user.resetCodeExpiration = undefined; // Reset de vervaldatum van de verificatiecode
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error during password reset:", error.message);
    return res.status(500).json({ message: "An error occurred." });
  }
};

module.exports = {
  signup,
  login,
  destroy,
  index,
  update,
  show,
  forgotPassword,
  verifyCode,
  resetPassword,
};
