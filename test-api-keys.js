const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Read API keys from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const keyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
const keysString = keyMatch ? keyMatch[1].trim() : "";


async function testKeys() {
    const apiKeys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);

    console.log(`\n🔑 Found ${apiKeys.length} API keys to test\n`);

    for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        const keyPreview = `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;

        try {
            const genAI = new GoogleGenerativeAI(key);

            // Try to list models to see what's available
            console.log(`Testing Key ${i + 1}: ${keyPreview}`);

            // Try with gemini-pro (most stable)
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Say 'Hello' in one word");
            const response = await result.response;
            const text = response.text();

            console.log(`✅ Key ${i + 1} WORKS! Response: ${text}\n`);

        } catch (error) {
            console.log(`❌ Key ${i + 1} FAILED!`);
            console.log(`   Error: ${error.message}\n`);
        }
    }
}

testKeys().catch(console.error);
