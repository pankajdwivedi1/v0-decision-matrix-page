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

function transformFileContent(content) {
    const lines = content.split('\n');
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Check if this line is the dangerouslySetInnerHTML line we messed up
        if (trimmedLine.startsWith('dangerouslySetInnerHTML={{ __html: `\\\\(') && trimmedLine.includes('${latex.')) {

            // Look at previous line to see if it's the opening <p> tag
            let prevLineIndex = i - 1;
            while (prevLineIndex >= 0 && lines[prevLineIndex].trim() === '') prevLineIndex--;

            const isWrappedInP = prevLineIndex >= 0 && lines[prevLineIndex].trim() === '<p className="text-center">';

            if (isWrappedInP) {
                // We found the pattern:
                // <p ...>
                //   dangerouslySetInnerHTML...
                // </p> (presumably next)

                // Remove the previous <p> line from newLines (it was already added, so pop it)
                // Check if the last added line was empty (we skipped empty lines in backward search but added them)
                // Actually, let's simpler logic: just modify the lines array in place or track indices better.
                // It's safer to just handle the current line and set a flag to skip the next </p> and remove the previous <p> from result.
            }
        }
    }

    // Let's try a regex replace on the whole content again but with EXACT exact string matching
    // The string in file is: dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }}

    // We want to replace:
    // <p className="text-center">
    //     dangerouslySetInnerHTML={{ __html: `\\(${latex.somevar}\\)` }}
    // </p>

    // with:
    // <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\(${latex.somevar}\\)` }} />

    // Regex constructs:
    // <p className="text-center">  -> /<p className="text-center">/
    // \s*                          -> /\s*/
    // dangerouslySetInnerHTML...   -> /dangerouslySetInnerHTML=\{\{ __html: `\\\\\((\$\{latex\.[a-zA-Z0-9_]+?\})\\\\\)` \}\}/
    // \s*                          -> /\s*/
    // </p>                         -> /<\/p>/

    return content.replace(
        /<p className="text-center">\s*dangerouslySetInnerHTML=\{\{ __html: `\\\\\((\$\{latex\.[^}]+?\})\\\\\)` \}\}\s*<\/p>/g,
        '<div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\\\($1\\\\)` }} />'
    );
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        content = transformFileContent(content);

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Repaired: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`- No match found in: ${path.basename(filePath)}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error processing ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

console.log('Starting formula rendering repair (attempt 3)...\n');

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
