const axios = require("axios");

const analyzeImage = async (imageUrl) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations", // Correct endpoint for image-related tasks
      {
        prompt: `Analyze the following image: ${imageUrl}`, // Use a text-based prompt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      altText: response.data.alt_text || "No alt text available",
      seoKeywords: response.data.seo_keywords || [],
    };
  } catch (error) {
    console.error(
      "Error during image analysis:",
      error.response ? error.response.data : error.message
    );
    throw new Error("AI analysis failed");
  }
};

module.exports = analyzeImage;
