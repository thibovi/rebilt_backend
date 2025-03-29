const axios = require("axios");

const analyzeImage = async (imageUrl) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generate-alt-text",
      {
        image: imageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      altText: response.data.alt_text,
      seoKeywords: response.data.seo_keywords,
    };
  } catch (error) {
    console.error("Fout bij AI-analyse van afbeelding:", error);
    throw new Error("AI-analyse mislukt");
  }
};

module.exports = { analyzeImage };
