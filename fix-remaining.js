const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

const filesToFix = [
  'CRITICFormula.tsx',
  'EDASFormula.tsx',
  'EntropyFormula.tsx',
  'EqualWeightsFormula.tsx',
  'MOORAFormula.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(componentsDir, file);
  console.log(`Fixing ${file}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    
    // Fix the pattern: <p className="text-center">dangerouslySetInnerHTML={{ __html: `\\($\{...\}\\)` }}</p>
    fixedContent = fixedContent.replace(
      /<p className="text-center">dangerouslySetInnerHTML=\{\{ __html: `\\\\\\(\\$\\{([^}]+)\\\\` \\}\}<\/p>/g,
      '<p className="text-center" dangerouslySetInnerHTML={{ __html: `\\\\\\(${\\1}\\\\` }}></p>'
    );

    // Fix the pattern: <p className="text-center mb-4">dangerouslySetInnerHTML={{ __html: `\\($\{...\}\\)` }}</p>
    fixedContent = fixedContent.replace(
      /<p className="text-center mb-4">dangerouslySetInnerHTML=\{\{ __html: `\\\\\\(\\$\\{([^}]+)\\\\` \\}\}<\/p>/g,
      '<p className="text-center mb-4" dangerouslySetInnerHTML={{ __html: `\\\\\\(${\\1}\\\\` }}></p>'
    );

    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed ${file}`);
    } else {
      console.log(`ℹ️  No changes needed for ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('All files have been processed!');
