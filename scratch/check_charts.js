
const fs = require('fs');
const content = fs.readFileSync('app/application/page.tsx', 'utf8');
const lines = content.split('\n');

const chartRegex = /<(BarChart|LineChart|AreaChart|ComposedChart|ScatterChart|RadarChart|RadialBarChart|PieChart)/;
const marginRegex = /margin=\{\{\s*top:\s*chartSettings/;

let currentSection = "";
const results = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Try to identify section
  if (line.includes('<CardTitle')) {
      currentSection = line.trim();
  }

  if (chartRegex.test(line)) {
    let hasMarginSettings = false;
    // Check next 10 lines for margin
    for (let j = i; j < i + 10 && j < lines.length; j++) {
      if (marginRegex.test(lines[j])) {
        hasMarginSettings = true;
        break;
      }
    }
    
    if (!hasMarginSettings) {
      results.push({
        line: i + 1,
        type: line.trim(),
        section: currentSection
      });
    }
  }
}

console.log(JSON.stringify(results, null, 2));
