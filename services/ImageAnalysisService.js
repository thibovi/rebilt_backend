const axios = require("axios");
const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs"); // Browsergebaseerde TensorFlow.js
const mobilenet = require("@tensorflow-models/mobilenet");
const { createCanvas, loadImage } = require("@napi-rs/canvas"); // Gebruik @napi-rs/canvas

const analyzeImage = async (imagePath) => {
  try {
    // Laad de afbeelding met @napi-rs/canvas
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Laad het MobileNet-model
    const model = await mobilenet.load();

    // Voer voorspellingen uit
    const predictions = await model.classify(canvas);

    // Retourneer de voorspellingen als keywords
    const keywords = predictions.map((prediction) => prediction.className);

    return {
      message: "Image analysis completed successfully",
      keywords,
    };
  } catch (error) {
    console.error("Error during image analysis:", error.message);

    // Debugging voor netwerkfouten
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    throw new Error("Image analysis failed");
  }
};

module.exports = analyzeImage;
