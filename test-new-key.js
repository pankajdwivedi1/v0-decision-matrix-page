const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testNewKey() {
    const newKey = "AIzaSyDuxxGb-DhnW-vqNi4HMDQZcX70M3R1mtU";

    console.log("\n🔑 Testing new API key...\n");

    try {
        const genAI = new GoogleGenerativeAI(newKey);

        // Try gemini-2.5-flash
        console.log("Testing with gemini-2.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Say 'Hello' in one word");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS! Model works!");
        console.log(`Response: ${text}\n`);

    } catch (error) {
        console.log("❌ gemini-2.5-flash failed:");
        console.log(`   ${error.message}\n`);

        // Try gemini-1.5-pro if 2.5 fails
        try {
            console.log("Trying gemini-1.5-pro instead...");
            const genAI = new GoogleGenerativeAI(newKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent("Say 'Hello' in one word");
            const response = await result.response;
            const text = response.text();

            console.log("✅ SUCCESS with gemini-1.5-pro!");
            console.log(`Response: ${text}\n`);

        } catch (error2) {
            console.log("❌ gemini-1.5-pro also failed:");
            console.log(`   ${error2.message}\n`);
        }
    }
}

testNewKey().catch(console.error);
