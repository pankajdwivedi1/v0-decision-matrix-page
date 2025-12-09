const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

// Get all formula component files
const formulaFiles = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('Formula.tsx'));

// Process each file
formulaFiles.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all instances of the pattern and replace them
  const pattern = /<p className="text-center">dangerouslySetInnerHTML=\{\{ __html: `\\\\\(\$\\{([^}]+)\\\)` \}\}<\/p>/g;
  
  let newContent = content;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const latexVar = match[1];
    const replacement = `<p className="text-center" dangerouslySetInnerHTML={{ __html: \`\\\\\($\\{${latexVar}}\\\)\` }}></p>`;
    newContent = newContent.replace(fullMatch, replacement);
  }
  
  // Write the updated content back to the file
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('All formula components have been updated!');
