// Test script to verify LOPCOW and DEMATEL APIs
const testData = {
    alternatives: [
        { id: "alt-0", name: "Alternative 1", scores: { "crit-0": 5, "crit-1": 10, "crit-2": 15 } },
        { id: "alt-1", name: "Alternative 2", scores: { "crit-0": 6, "crit-1": 11, "crit-2": 16 } },
        { id: "alt-2", name: "Alternative 3", scores: { "crit-0": 7, "crit-1": 12, "crit-2": 17 } }
    ],
    criteria: [
        { id: "crit-0", name: "C1", weight: 0.33, type: "beneficial" },
        { id: "crit-1", name: "C2", weight: 0.33, type: "beneficial" },
        { id: "crit-2", name: "C3", weight: 0.34, type: "beneficial" }
    ]
};

async function testWeightMethods() {
    console.log("Testing LOPCOW Weight Method...");
    try {
        const lopcowResponse = await fetch("http://localhost:3000/api/calculate/lopcow-weights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testData)
        });
        const lopcowData = await lopcowResponse.json();
        console.log("LOPCOW Result:", JSON.stringify(lopcowData, null, 2));
    } catch (error) {
        console.error("LOPCOW Error:", error);
    }

    console.log("\nTesting DEMATEL Weight Method...");
    try {
        const dematelResponse = await fetch("http://localhost:3000/api/calculate/dematel-weights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testData)
        });
        const dematelData = await dematelResponse.json();
        console.log("DEMATEL Result:", JSON.stringify(dematelData, null, 2));
    } catch (error) {
        console.error("DEMATEL Error:", error);
    }
}

testWeightMethods();
