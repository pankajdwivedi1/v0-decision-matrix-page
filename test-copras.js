// Test COPRAS calculation
const matrix = [
    { id: "alt-0", name: "Supplier A", scores: { "crit-0": 150, "crit-1": 8, "crit-2": 5, "crit-3": 9, "crit-4": 7 } },
    { id: "alt-1", name: "Supplier B", scores: { "crit-0": 200, "crit-1": 9, "crit-2": 3, "crit-3": 8, "crit-4": 9 } },
    { id: "alt-2", name: "Supplier C", scores: { "crit-0": 120, "crit-1": 7, "crit-2": 7, "crit-3": 7, "crit-4": 6 } },
    { id: "alt-3", name: "Supplier D", scores: { "crit-0": 180, "crit-1": 8.5, "crit-2": 4, "crit-3": 9, "crit-4": 8 } },
    { id: "alt-4", name: "Supplier E", scores: { "crit-0": 160, "crit-1": 7.5, "crit-2": 6, "crit-3": 8, "crit-4": 7.5 } },
];

const criteria = [
    { id: "crit-0", name: "Price", type: "non-beneficial", weight: 0.2 },
    { id: "crit-1", name: "Quality", type: "beneficial", weight: 0.25 },
    { id: "crit-2", name: "Delivery Time", type: "non-beneficial", weight: 0.15 },
    { id: "crit-3", name: "Reliability", type: "beneficial", weight: 0.25 },
    { id: "crit-4", name: "Service", type: "beneficial", weight: 0.15 },
];

function calculateCOPRAS(alternatives, criteria) {
    const scores = {};
    const epsilon = 1e-12;

    const m = alternatives.length;
    const n = criteria.length;

    if (m === 0 || n === 0) return scores;

    // Step 1: decision matrix x_ij
    const matrix = alternatives.map((alt) =>
        criteria.map((crit) => alt.scores[crit.id] ?? 0)
    );

    console.log("Step 1 - Decision Matrix:");
    alternatives.forEach((alt, i) => {
        console.log(`  ${alt.name}: [${matrix[i].join(", ")}]`);
    });

    // Step 2: normalize by column sums
    const colSums = [];
    for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let i = 0; i < m; i++) {
            sum += matrix[i][j];
        }
        if (sum === 0) sum = 1;
        colSums[j] = sum;
    }

    console.log("\nStep 2 - Column Sums:", colSums);

    const r = Array.from({ length: m }, () => Array(n).fill(0));
    const q = Array.from({ length: m }, () => Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            r[i][j] = matrix[i][j] / colSums[j];
            q[i][j] = r[i][j] * criteria[j].weight;
        }
    }

    console.log("\nStep 3 - Normalized Matrix (r):");
    alternatives.forEach((alt, i) => {
        console.log(`  ${alt.name}: [${r[i].map(v => v.toFixed(4)).join(", ")}]`);
    });

    console.log("\nStep 3 - Weighted Normalized Matrix (q):");
    alternatives.forEach((alt, i) => {
        console.log(`  ${alt.name}: [${q[i].map(v => v.toFixed(4)).join(", ")}]`);
    });

    // Step 4: S+ and S- for each alternative
    const Splus = Array(m).fill(0);
    const Sminus = Array(m).fill(0);

    let hasBeneficial = false;
    let hasNonBeneficial = false;

    for (let j = 0; j < n; j++) {
        const isNonBeneficial = criteria[j].type === "non-beneficial";
        if (isNonBeneficial) hasNonBeneficial = true;
        else hasBeneficial = true;

        for (let i = 0; i < m; i++) {
            if (isNonBeneficial) {
                Sminus[i] += q[i][j];
            } else {
                Splus[i] += q[i][j];
            }
        }
    }

    console.log("\nStep 4 - S+ and S-:");
    alternatives.forEach((alt, i) => {
        console.log(`  ${alt.name}: S+ = ${Splus[i].toFixed(4)}, S- = ${Sminus[i].toFixed(4)}`);
    });

    // If there are no cost (non-beneficial) criteria, COPRAS reduces to S+ ranking
    if (!hasNonBeneficial) {
        console.log("\nNo non-beneficial criteria, using S+ as final score");
        for (let i = 0; i < m; i++) {
            scores[alternatives[i].id] = Splus[i];
        }
        return scores;
    }

    // Guard against all-zero Sminus
    for (let i = 0; i < m; i++) {
        if (Sminus[i] <= 0) Sminus[i] = epsilon;
    }

    const SminusMin = Math.min(...Sminus);
    const totalSminus = Sminus.reduce((acc, v) => acc + v, 0) || epsilon;

    const sumFraction = Sminus.reduce(
        (acc, v) => acc + SminusMin / (v || epsilon),
        0
    ) || epsilon;

    console.log("\nStep 5 - Intermediate values:");
    console.log(`  SminusMin = ${SminusMin.toFixed(4)}`);
    console.log(`  totalSminus = ${totalSminus.toFixed(4)}`);
    console.log(`  sumFraction = ${sumFraction.toFixed(4)}`);

    // Step 5: compute Q_i
    console.log("\nStep 5 - Q_i calculation:");
    for (let i = 0; i < m; i++) {
        const denom = Sminus[i] * sumFraction || epsilon;
        const secondTerm = (SminusMin * totalSminus) / denom;
        const Qi = Splus[i] + secondTerm;

        console.log(`  ${alternatives[i].name}: Q = ${Splus[i].toFixed(4)} + (${SminusMin.toFixed(4)} × ${totalSminus.toFixed(4)}) / (${Sminus[i].toFixed(4)} × ${sumFraction.toFixed(4)}) = ${Splus[i].toFixed(4)} + ${secondTerm.toFixed(4)} = ${Qi.toFixed(4)}`);

        scores[alternatives[i].id] = Qi;
    }

    return scores;
}

const results = calculateCOPRAS(matrix, criteria);

console.log("\n=== FINAL RESULTS ===");
console.log("Scores:", results);

// Sort and rank
const ranking = matrix
    .map((alt) => ({
        name: alt.name,
        score: results[alt.id],
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
        rank: index + 1,
        ...item,
    }));

console.log("\nRanking (higher is better):");
ranking.forEach(r => {
    console.log(`  ${r.rank}. ${r.name}: ${r.score.toFixed(4)}`);
});
