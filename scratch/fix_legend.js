const fs = require('fs');
const path = require('path');

const filePath = path.join('app', 'application', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The target string to replace
const target = "transform: legCfg.align === 'center' ? 'translateX(-50%)' : undefined";
// The new string
const replacement = "transform: `${legCfg.align === 'center' ? 'translateX(-50%)' : ''} translate(${chartSettings.legendOffsetX}px, ${chartSettings.legendOffsetY}px)`";

if (content.includes(target)) {
    console.log("Found target. Replacing...");
    content = content.split(target).join(replacement);
    fs.writeFileSync(filePath, content);
    console.log("Success.");
} else {
    console.log("Target not found. Searching for variations...");
    // Try with and without backticks
    const target2 = 'transform: `${legCfg.align === "center" ? "translateX(-50%)" : ""}`';
    if (content.includes(target2)) {
         console.log("Found variation. Replacing...");
         content = content.split(target2).join(replacement);
         fs.writeFileSync(filePath, content);
    } else {
        console.log("No known variations found.");
    }
}
