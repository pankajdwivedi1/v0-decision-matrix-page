// Test COPRAS API call
const data = {
    method: "copras",
    alternatives: [
        { id: "alt-0", name: "Supplier A", scores: { "crit-0": 150, "crit-1": 8, "crit-2": 5, "crit-3": 9, "crit-4": 7 } },
        { id: "alt-1", name: "Supplier B", scores: { "crit-0": 200, "crit-1": 9, "crit-2": 3, "crit-3": 8, "crit-4": 9 } },
        { id: "alt-2", name: "Supplier C", scores: { "crit-0": 120, "crit-1": 7, "crit-2": 7, "crit-3": 7, "crit-4": 6 } },
        { id: "alt-3", name: "Supplier D", scores: { "crit-0": 180, "crit-1": 8.5, "crit-2": 4, "crit-3": 9, "crit-4": 8 } },
        { id: "alt-4", name: "Supplier E", scores: { "crit-0": 160, "crit-1": 7.5, "crit-2": 6, "crit-3": 8, "crit-4": 7.5 } },
    ],
    criteria: [
        { id: "crit-0", name: "Price", type: "non-beneficial", weight: 0.2 },
        { id: "crit-1", name: "Quality", type: "beneficial", weight: 0.25 },
        { id: "crit-2", name: "Delivery Time", type: "non-beneficial", weight: 0.15 },
        { id: "crit-3", name: "Reliability", type: "beneficial", weight: 0.25 },
        { id: "crit-4", name: "Service", type: "beneficial", weight: 0.15 },
    ]
};

fetch('http://localhost:3000/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
    .then(res => res.json())
    .then(result => {
        console.log("=== COPRAS API Response ===");
        console.log("Results:", JSON.stringify(result.results, null, 2));
        console.log("\nRanking:");
        result.ranking.forEach(r => {
            console.log(`  ${r.rank}. ${r.alternativeName}: Score = ${r.score.toFixed(4)}`);
        });
    })
    .catch(err => console.error("Error:", err));
