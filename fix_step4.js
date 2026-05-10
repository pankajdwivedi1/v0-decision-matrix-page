const fs = require('fs');
const path = 'app/application/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Find the boundaries of the Step 4 chart section
const startMarker = 'const isRankView = rankingChartType.includes("Rank")';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

// Find the end of the ResponsiveContainer block
// The Step 4 chart is wrapped in: <ResponsiveContainer ...> {(() => { ... })()} </ResponsiveContainer>
const searchContent = content.substring(startIndex);
let endOffset = searchContent.indexOf('})()}</ResponsiveContainer>');
if (endOffset === -1) {
    // try different pattern
    endOffset = searchContent.indexOf('</ResponsiveContainer>');
}

if (endOffset === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

const endIndex = startIndex + endOffset;

let step4Content = content.substring(startIndex, endIndex);

// 1. Replace all explicit fontSize values derived from chartSettings.fontSize with the mobile-aware version
// This matches: fontSize: chartSettings.fontSize, fontSize: chartSettings.fontSize + 1, fontSize: chartSettings.fontSize - 2, etc.
step4Content = step4Content.replace(/fontSize:\s*chartSettings\.fontSize(?:\s*[-+]\s*\d+)?/g, 'fontSize: isMobile ? Math.max(7, chartSettings.fontSize - 3) : chartSettings.fontSize');

// 2. Add textAnchor: 'middle' to XAxis and YAxis label styles
// A label style typically looks like: style: { fontSize: ..., fontWeight: 700, fill: themeColors.text }
// Let's replace the `label={` property.
// Specifically, it matches: style: { ... } inside a label prop.
// A simpler robust way:
step4Content = step4Content.replace(/label=\{chartSettings\.showAxisTitles\s*\?\s*\{([^}]+)style:\s*\{([^}]+)\}\s*\}\s*:\s*undefined\}/g, (match, beforeStyle, styleContent) => {
    if (!styleContent.includes('textAnchor')) {
        return `label={chartSettings.showAxisTitles ? {${beforeStyle}style: { textAnchor: 'middle', ${styleContent.trim()} } } : undefined}`;
    }
    return match;
});

// Also replace the labels without `chartSettings.showAxisTitles ?` if any exist:
// label={{ value: 'Robot Alternatives', position: 'insideBottom', offset: chartSettings.xAxisOffset, style: { fontSize: ..., fontWeight: 700, fill: themeColors.text } }}
step4Content = step4Content.replace(/label=\{\{\s*value:\s*'[^']+',\s*position:\s*'[^']+',\s*offset:\s*chartSettings\.[x|y]AxisOffset,\s*style:\s*\{([^}]+)\}\s*\}\}/g, (match, styleContent) => {
    if (!styleContent.includes('textAnchor')) {
        return match.replace(`style: {${styleContent}}`, `style: { textAnchor: 'middle', ${styleContent.trim()} }`);
    }
    return match;
});

// Check legend text sizes:
// The wrapperStyle in legends usually have: fontSize: `${chartSettings.fontSize - 1}px`,
step4Content = step4Content.replace(/fontSize:\s*`\$\{chartSettings\.fontSize\s*[-+]\s*\d+\}px`/g, 'fontSize: `${isMobile ? Math.max(7, chartSettings.fontSize - 3) : chartSettings.fontSize}px`');

content = content.substring(0, startIndex) + step4Content + content.substring(endIndex);

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully updated Step 4 font sizes and alignment.");
