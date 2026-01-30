
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAufQmo0B2su_pwDXE57ST7caNpm22PyGw");
        const data = await response.json();

        if (data.models) {
            // Log ALL models
            console.log(data.models.map(m => m.name));
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
