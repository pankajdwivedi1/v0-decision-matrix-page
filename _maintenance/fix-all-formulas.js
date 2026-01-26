const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

// List of formula components that need fixing
const formulaFiles = [
  'COPRASFormula.tsx',
  'CRITICFormula.tsx',
  'EDASFormula.tsx',
  'EntropyFormula.tsx',
  'EqualWeightsFormula.tsx',
  'MOORAFormula.tsx'
];

formulaFiles.forEach(file => {
  const filePath = path.join(componentsDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the dangerouslySetInnerHTML pattern
    const fixedContent = content.replace(
      /<p className="text-center">dangerouslySetInnerHTML=\{\{ __html: `\\\\\(\$\\{([^}]+)\\\)` \}\}<\/p>/g,
      '<p className="text-center" dangerouslySetInnerHTML={{ __html: `\\\\\(${\1}\\\` }}></p>'
    );
    
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed ${file}`);
    } else {
      console.log(`No changes needed for ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('All formula components have been processed!');
