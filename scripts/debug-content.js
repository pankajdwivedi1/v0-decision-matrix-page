const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'SWEIFormula.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

console.log('--- DEBUG START ---');
for (let i = 110; i < 118; i++) {
    console.log(`Line ${i}: ${JSON.stringify(lines[i])}`);
}
console.log('--- DEBUG END ---');
