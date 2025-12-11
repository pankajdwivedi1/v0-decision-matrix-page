
import os
import re

components_dir = r"c:\Users\PANKAJ DWIVEDI\OneDrive\Desktop\v0-decision-matrix-page\components"

pattern = r"    // Re-run typeset on updates\n    useEffect\(\(\) => \{\n        setTimeout\(\(\) => window\.MathJax\?\.typesetPromise\?\.(\(\)), 50\);\n    \}\);"
replacement = r"    // Re-run typeset on updates\n    useEffect(() => {\n        setTimeout(() => window.MathJax?.typesetPromise?.(), 50);\n    }, []);"

count = 0

for filename in os.listdir(components_dir):
    if filename.endswith("Formula.tsx"):
        filepath = os.path.join(components_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if the file has the problematic useEffect
        if "useEffect(() => {" in content and "setTimeout(() => window.MathJax?.typesetPromise?.(), 50);" in content and "}, []);" not in content and "});" in content:
             # Use generic replacement for the specific block
             # Note: regex might be tricky with multiline, trying simple string replace first if exact match
             
             target_string = """    // Re-run typeset on updates
    useEffect(() => {
        setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    });"""
             
             replacement_string = """    // Re-run typeset on updates
    useEffect(() => {
        setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    }, []);"""
             
             if target_string in content:
                 new_content = content.replace(target_string, replacement_string)
                 with open(filepath, "w", encoding="utf-8") as f:
                     f.write(new_content)
                 print(f"Fixed {filename}")
                 count += 1
             else:
                 print(f"Skipping {filename} - Pattern not found exactly")

print(f"Total fixed: {count}")
