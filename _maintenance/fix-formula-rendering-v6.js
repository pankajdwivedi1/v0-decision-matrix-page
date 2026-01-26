const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'components');

const filesToUpdate = [
    'AHPFormula.tsx',
    'COCOSOFormula.tsx',
    'CODASFormula.tsx',
    'COPRASFormula.tsx',
    'CRITICFormula.tsx',
    'EDASFormula.tsx',
    'ELECTRE1Formula.tsx',
    'ELECTRE2Formula.tsx',
    'ELECTREFormula.tsx',
    'EntropyFormula.tsx',
    'EqualWeightsFormula.tsx',
    'MAIRCAFormula.tsx',
    'MARCOSFormula.tsx',
    'MOORAFormula.tsx',
    'MOOSRAFormula.tsx',
    'MULTIMOORAFormula.tsx',
    'PIPRECIAFormula.tsx',
    'PROMETHEE1Formula.tsx',
    'PROMETHEE2Formula.tsx',
    'SWEIFormula.tsx',
    'SWIFormula.tsx',
    'TODIMFormula.tsx',
    'TOPSISFormula.tsx',
    'VIKORFormula.tsx',
    'WASPASFormula.tsx'
];

function fixScrollbarsAndTags(content) {
    let newContent = content;

    // 1. Switch back to display math \[ ... \] instead of inline math \( ... \)
    // This should restore equation numbers (\tag) and center alignment naturally.
    // The regex finds: dangerouslySetInnerHTML={{ __html: `\\(${latex.var}\\)` }}
    // and changes it to: dangerouslySetInnerHTML={{ __html: `\\[${latex.var}\\]` }}

    newContent = newContent.replace(
        /dangerouslySetInnerHTML=\{\{ __html: `\\\\\((\$\{latex\.[^}]+?\})\\\\\)` \}\}/g,
        'dangerouslySetInnerHTML={{ __html: `\\\\[$1\\\\]` }}'
    );

    // 2. Adjust CSS to remove forced scrollbars from the math container
    // We want to change the injected CSS block.
    // Find the block that defines .latex mjx-container

    const cssPattern = /\.latex mjx-container \{[^}]*overflow-x: auto !important;[^}]*overflow-y: visible !important;[^}]*\}/s;

    // We'll replace the scroll properties with just overflow-x: auto (only if needed) and NO overflow-y or visible.
    // Actually, standard MathJax display blocks handle their own layout well.
    // Let's relax the CSS.

    // But strictly, we can just edit the CSS string if we find it.
    // The CSS is inside a template literal in the file.

    // We will replace:
    // overflow-x: auto !important;
    // with:
    // overflow-x: hidden !important; 
    // (or just remove the line, but replacement is easier reliably)

    // Wait, if content IS wide, we need scroll. But unwanted scrollbars appear when width is 100% + padding/border.

    // Let's modify the CSS replacement strategy.
    // We will simply REWRITE the specific CSS lines in the file to be safe.

    // Replace overflow-x: auto !important; with overflow-x: auto; (remove important)
    // Replace overflow-y: visible !important; with overflow-y: hidden; 

    newContent = newContent.replace('overflow-x: auto !important;', 'overflow-x: auto;');
    newContent = newContent.replace('overflow-y: visible !important;', 'overflow-y: hidden;');

    // Also remove the explicit "display: block !important" which might conflict with display math mode
    newContent = newContent.replace('display: block !important;', '');

    return newContent;
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        content = fixScrollbarsAndTags(content);

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Updated: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`- No changes needed: ${path.basename(filePath)}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error processing ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

console.log('Starting formula rendering fix (v6 - restore tags and scrollbars)...\n');

let updatedCount = 0;
for (const fileName of filesToUpdate) {
    const filePath = path.join(componentsDir, fileName);
    if (fs.existsSync(filePath)) {
        if (updateFile(filePath)) {
            updatedCount++;
        }
    }
}

console.log(`\n✓ Complete! Updated ${updatedCount} files.`);
