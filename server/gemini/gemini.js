const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = "I am planning a 4-day trip to Bali, Indonesia. Can you create an itinerary with activities, key attractions, and dining options for each day? Include travel tips and any must-see landmarks.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
}
run();
