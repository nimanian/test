require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// Ensure API Key Exists
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: Missing OpenAI API Key in environment variables!");
    process.exit(1);
}
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Health Check Route
app.get("/", (req, res) => {
    res.send("✅ ChatGPT Backend is Running!");
});

// ChatGPT API Route
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "❌ Message is required." });
        }

        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }]
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            }
        });

        if (!response.data.choices || response.data.choices.length === 0) {
            return res.status(500).json({ error: "❌ Invalid response from OpenAI." });
        }

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error("🚨 OpenAI API Error:", error.response ? error.response.data : error);
        res.status(500).json({
            error: "❌ Internal Server Error. Check server logs.",
            details: error.response ? error.response.data : error.message
        });
    }
});

// Use a Dynamic Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
