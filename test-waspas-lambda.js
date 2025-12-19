async function testWaspasLambda() {
    const alternatives = [
        { id: 'alt-1', name: 'Alt 1', scores: { 'crit-1': 10, 'crit-2': 20 } },
        { id: 'alt-2', name: 'Alt 2', scores: { 'crit-1': 20, 'crit-2': 10 } }
    ];
    const criteria = [
        { id: 'crit-1', name: 'Crit 1', weight: 0.5, type: 'beneficial' },
        { id: 'crit-2', name: 'Crit 2', weight: 0.5, type: 'beneficial' }
    ];

    const testLambda = async (lambda) => {
        console.log(`Testing with lambda: ${lambda}`);
        try {
            const response = await fetch('http://localhost:3000/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method: 'waspas',
                    alternatives,
                    criteria,
                    waspasLambdaValue: lambda
                })
            });
            const data = await response.json();
            console.log(`Ranking for lambda ${lambda}:`, data.ranking.map(r => `${r.alternativeName}: ${Number(r.score).toFixed(6)}`).join(', '));
        } catch (err) {
            console.error(`Error for lambda ${lambda}:`, err.message);
        }
    };

    try {
        await testLambda(0.1);
        await testLambda(0.5);
        await testLambda(0.9);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testWaspasLambda();
