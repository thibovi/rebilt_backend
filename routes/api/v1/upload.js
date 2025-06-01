const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Multer in-memory opslag
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/v1/upload/texture
router.post("/texture", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", folder: "textures" },
        (error, result) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Cloudinary upload failed", error });
          }
          res.json({ url: result.secure_url });
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

module.exports = router;
