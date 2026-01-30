const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

async function testKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing API Key:", apiKey ? "Found key ending in ..." + apiKey.slice(-4) : "No key found");

    if (!apiKey) {
        console.error("Please add GEMINI_API_KEY to your .env file");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // 1. Try to list models (The error message suggested this)
        console.log("Attempting to list available models...");
        // Note: getGenerativeModel doesn't have a list method on the instance, 
        // but we can try a simple generation to see if *any* model works, 
        // or use the model manager if exposed, but standard check is usually just trying a call.
        // Actually, the error `Call ListModels` refers to the REST API. 
        // The SDK doesn't expose listModels directly on the main class in some versions, 
        // but let's try a simple generation with 'gemini-pro' which SHOULD exist.

        // Changing approach: The SDK doesn't have a simple "list models" method in the simplified interface 
        // that is easy to call without setup. 
        // Let's just try to generate content with 'gemini-1.5-flash'.

        const modelName = "gemini-1.5-flash";
        console.log(`Attempting to generate content with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, can you hear me?");
        const response = await result.response;
        console.log("SUCCESS! The API Key is valid.");
        console.log("Response:", response.text());

    } catch (error) {
        console.error("\n--- API KEY VERIFICATION FAILED ---");
        console.error("Error details:", error.message);

        if (error.message.includes("404")) {
            console.error("\nDIAGNOSIS: The API Key is active, but the 'Generative Language API' is likely NOT ENABLED for this project, OR you are using a model name that doesn't exist for your tier.");
        } else if (error.message.includes("403") || error.message.includes("400")) {
            console.error("\nDIAGNOSIS: The API Key itself is likely INVALID or deleted.");
        }
    }
}

testKey();
