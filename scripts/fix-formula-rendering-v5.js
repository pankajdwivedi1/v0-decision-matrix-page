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

function transformContent(content) {
    // Pattern 1: Single line <p ... dangerouslySetInnerHTML... ></p>
    // Based on debug output: <p className="text-center" dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }}></p>
    const pattern1 = /<p className="text-center" dangerouslySetInnerHTML=\{\{ __html: `\\\\\((\$\{latex\.[^}]+?\})\\\\\)` \}\}\s*><\/p>/g;

    // Pattern 2: Multiline
    // <p className="text-center">
    //    dangerouslySetInnerHTML...
    // </p>
    const pattern2 = /<p className="text-center">\s*dangerouslySetInnerHTML=\{\{ __html: `\\\\\((\$\{latex\.[^}]+?\})\\\\\)` \}\}\s*<\/p>/g;

    // The replacement we want:
    // <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\(${latex.var}\)` }} />
    const replacement = '<div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\\\($1\\\\)` }} />';

    let newContent = content;

    // Apply Pattern 1
    newContent = newContent.replace(pattern1, replacement);

    // Apply Pattern 2
    newContent = newContent.replace(pattern2, replacement);

    return newContent;
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        content = transformContent(content);

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Repaired: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`- No match found in: ${path.basename(filePath)} - checking content...`);
            // Check if it has the latex variable at all to verify if it's relevant
            if (!content.includes('${latex.')) {
                console.log('  (File does not contain latex variables in expected format)');
            }
            return false;
        }
    } catch (error) {
        console.error(`✗ Error processing ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

console.log('Starting formula rendering repair (attempt 5 - multi-pattern regex)...\n');

let updatedCount = 0;
for (const fileName of filesToUpdate) {
    const filePath = path.join(componentsDir, fileName);
    if (fs.existsSync(filePath)) {
        if (updateFile(filePath)) {
            updatedCount++;
        }
    }
}

console.log(`\n✓ Complete! Repaired ${updatedCount} files.`);
