
async function testMethod(name, endpoint, payload) {
    console.log(`Testing ${name}...`);
    try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log(`${name} status: ${response.status}`);
        if (!response.ok) {
            const error = await response.json();
            console.log(`${name} error:`, error);
        } else {
            const data = await response.json();
            console.log(`${name} success: weights count = ${Object.keys(data.weights || {}).length}`);
        }
    } catch (err) {
        console.error(`${name} failed:`, err.message);
    }
}

const criteria = [
    { id: "c1", name: "C1", weight: 0.5, type: "beneficial" },
    { id: "c2", name: "C2", weight: 0.5, type: "beneficial" }
];

const alternatives = [
    { id: "a1", name: "A1", scores: { c1: 10, c2: 20 } },
    { id: "a2", name: "A2", scores: { c1: 30, c2: 15 } }
];

const payload = { alternatives, criteria };

async function runTests() {
    await testMethod("Main API", "/api/calculate", { ...payload, method: "topsis" });
    await testMethod("Entropy", "/api/entropy-weights", payload);
    await testMethod("CRITIC", "/api/critic-weights", payload);
    await testMethod("MEREC", "/api/merec-weights", payload);
    await testMethod("WENSLO", "/api/wenslo-weights", payload);
    await testMethod("LOPCOW", "/api/lopcow-weights", payload);
    await testMethod("DEMATEL", "/api/dematel-weights", payload);
}

runTests();
