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

function transformLineBased(content) {
    const lines = content.split(/\r?\n/); // Handle both CRLF and LF
    const newLines = [];
    let i = 0;
    let modified = false;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Look for the opening P tag
        if (trimmed === '<p className="text-center">') {
            // Check if next line contains the bad dangerouslySetInnerHTML
            const nextLine = lines[i + 1];
            if (nextLine) {
                const nextTrimmed = nextLine.trim();
                // Check for start: dangerouslySetInnerHTML={{ __html: `\\(
                // AND end: \\)` }}
                if (nextTrimmed.startsWith('dangerouslySetInnerHTML={{ __html: `\\\\(')) {

                    // Check if line after that is closing p
                    const afterLine = lines[i + 2];
                    if (afterLine && afterLine.trim() === '</p>') {
                        // FOUND IT!
                        // Extract the latex variable part.
                        // expected format: dangerouslySetInnerHTML={{ __html: `\\(${latex.variable}\\)` }}
                        // we want to extract: ${latex.variable}

                        const match = nextTrimmed.match(/`\\\\\((\$\{latex\.[^}]+?\})\\\\\)`/);
                        if (match) {
                            const variable = match[1];
                            // maintain indentation of the P tag line
                            const indentation = line.substring(0, line.indexOf('<'));

                            const replacement = `${indentation}<div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: \`\\\\(${variable}\\\\)\` }} />`;

                            newLines.push(replacement);
                            i += 3; // Skip the p, content, and /p lines
                            modified = true;
                            continue;
                        }
                    }
                }
            }
        }

        newLines.push(line);
        i++;
    }

    return modified ? newLines.join('\n') : content;
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        content = transformLineBased(content);

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

console.log('Starting formula rendering repair (attempt 4 - line based)...\n');

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
