// Test script with more varied data to show DEMATEL produces different weights
const testData = {
    alternatives: [
        { id: "alt-0", name: "Alternative 1", scores: { "crit-0": 5, "crit-1": 20, "crit-2": 8 } },
        { id: "alt-1", name: "Alternative 2", scores: { "crit-0": 15, "crit-1": 10, "crit-2": 12 } },
        { id: "alt-2", name: "Alternative 3", scores: { "crit-0": 10, "crit-1": 15, "crit-2": 18 } },
        { id: "alt-3", name: "Alternative 4", scores: { "crit-0": 20, "crit-1": 5, "crit-2": 15 } }
    ],
    criteria: [
        { id: "crit-0", name: "C1", weight: 0.33, type: "beneficial" },
        { id: "crit-1", name: "C2", weight: 0.33, type: "beneficial" },
        { id: "crit-2", name: "C3", weight: 0.34, type: "beneficial" }
    ]
};

async function testWeightMethods() {
    console.log("Testing with VARIED data to show different weights...\n");

    console.log("Testing LOPCOW Weight Method...");
    try {
        const lopcowResponse = await fetch("http://localhost:3000/api/calculate/lopcow-weights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testData)
        });
        const lopcowData = await lopcowResponse.json();
        console.log("LOPCOW Weights:");
        Object.entries(lopcowData.weights).forEach(([key, value]) => {
            console.log(`  ${key}: ${value.toFixed(6)}`);
        });
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
        console.log("DEMATEL Weights:");
        Object.entries(dematelData.weights).forEach(([key, value]) => {
            console.log(`  ${key}: ${value.toFixed(6)}`);
        });
        console.log("\nDEMATEL Prominence (P) Values:");
        Object.entries(dematelData.pValues).forEach(([key, value]) => {
            console.log(`  ${key}: ${value.toFixed(6)}`);
        });
    } catch (error) {
        console.error("DEMATEL Error:", error);
    }
}

testWeightMethods();
