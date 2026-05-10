const fs = require('fs');
let c = fs.readFileSync('app/application/page.tsx', 'utf8');

// Fix YAxis and XAxis tick fonts
c = c.replace(/tick=\{\{ fontSize: chartSettings\.fontSize, fontWeight: 700, fill: themeColors\.text \}\}/g, 'tick={{ fontSize: mobileFs, fontWeight: 700, fill: themeColors.text }}');

// Fix axis label fonts and alignment
c = c.replace(/style: \{ fontSize: chartSettings\.fontSize \+ 1, fontStyle: 'italic', fill: themeColors\.text \}/g, \"style: { fontSize: mobileFs, fontStyle: 'italic', fill: themeColors.text, textAnchor: 'middle' }\");
c = c.replace(/style: \{ fontSize: chartSettings\.fontSize \+ 2, fontWeight: 700, fill: themeColors\.text \}/g, \"style: { fontSize: mobileFs, fontWeight: 700, fill: themeColors.text, textAnchor: 'middle' }\");

// Fix default chart at the end
c = c.replace(/tick=\{\{ fontSize: 10, fontWeight: 700, fill: \"#000\" \}\}/g, 'tick={{ fontSize: mobileFs, fontWeight: 700, fill: themeColors.text }}');
c = c.replace(/style: \{ fontSize: 12, fontWeight: 700, fill: '#000' \}/g, \"style: { fontSize: mobileFs, fontWeight: 700, fill: themeColors.text, textAnchor: 'middle' }\");

fs.writeFileSync('app/application/page.tsx', c, 'utf8');
console.log('Done');
