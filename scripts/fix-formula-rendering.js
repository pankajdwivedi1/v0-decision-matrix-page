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

function transformFormula(content) {
    // We need to match:
    // <p className="text-center">
    //     dangerouslySetInnerHTML={{ __html: `\(${latex.something}\)` }}
    // </p>

    // NOTE: The previous script outputted literally: dangerouslySetInnerHTML={{ __html: `\(${latex.step1}\)` }}
    // inside the p tag as text content.

    // Regex explanation:
    // <p className="text-center"> matches opening tag
    // \s* matches any whitespace including newlines
    // (dangerouslySetInnerHTML=\{\{ __html: `\\\\\((\$\{latex\.[a-zA-Z0-9_]+?\})\\\\\)` \}\}) captures the prop string
    // \s* matches trailing whitespace
    // <\/p> matches closing tag

    const regex = /<p className="text-center">\s*(dangerouslySetInnerHTML=\{\{ __html: `\\\\\((\$\{latex\.[a-zA-Z0-9_]+?\})\\\\\)` \}\})\s*<\/p>/g;

    // We want to transform it into a self-closing div with the captured prop string active, 
    // AND add the necessary styling props.

    const replacement = '<div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} $1 />';

    return content.replace(regex, replacement);
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        content = transformFormula(content);

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Repaired: ${path.basename(filePath)}`);
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

console.log('Starting formula rendering repair (attempt 2)...\n');

let updatedCount = 0;
for (const fileName of filesToUpdate) {
    const filePath = path.join(componentsDir, fileName);
    if (fs.existsSync(filePath)) {
        if (updateFile(filePath)) {
            updatedCount++;
        }
    } else {
        // console.log(`! File not found: ${fileName}`);
    }
}

console.log(`\n✓ Complete! Repaired ${updatedCount} files.`);
