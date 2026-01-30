
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAufQmo0B2su_pwDXE57ST7caNpm22PyGw");
        const data = await response.json();

        if (data.models) {
            const generatedModels = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name)
                .slice(0, 20); // Get first 20
            console.log("Generative Models (Head):", generatedModels);
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
