const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateTripItinerary(destination, days) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `I am planning a ${days}-day trip to ${destination}. Can you create an itinerary with activities, key attractions, and dining options for each day? Include travel tips and must-see landmarks.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = { generateTripItinerary };
