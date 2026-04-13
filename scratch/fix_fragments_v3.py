
import re

file_path = r'c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: <ResponsiveContainer ...> \n <>{ ... } \n </ResponsiveContainer>
# We remove the Fragment wrapper which causes the prop error
# Using a regex with lookbehind/ahead or mapping offsets
def fix_fragments(match):
    full = match.group(0)
    # Remove the first <>
    # and the last </> before the final </ResponsiveContainer>
    fixed = full.replace('<>', '', 1)
    # Find the last </> before the end
    last_fragment_idx = fixed.rfind('</>')
    if last_fragment_idx != -1:
        fixed = fixed[:last_fragment_idx] + fixed[last_fragment_idx+3:]
    return fixed

# Search for ResponsiveContainer containing a Fragment as immediate child
# This pattern matches ResponsiveContainer up to its closing tag, if it contains an immediate fragment
pattern = re.compile(r'(<ResponsiveContainer[^>]*>\s+)<>(.*?)</>(\s+</ResponsiveContainer>)', re.DOTALL)
content = pattern.sub(r'\1\2\3', content)

# Also fix the IIFE cases: {(() => { ... })()} </ResponsiveContainer>
# where there was a fragment inside the IIFE or wrapping it.
# Actually, the audit showed: 
# Line 5140: <ResponsiveContainer width="100%" height="100%">
#   Next child: <>{weightChartType === 'radar' ? (

# Let's use a very specific replacement for the known lines
content = content.replace("<>{weightChartType === 'radar' ? (", "{weightChartType === 'radar' ? (", 1)
# and we need to find where it's closed. Since we know it's before a </ResponsiveContainer>
# we'll look for the next </> followed by some spaces and </ResponsiveContainer>
content = re.sub(r'</>\s+</ResponsiveContainer>', r'</ResponsiveContainer>', content)

# Fix for line 6575
content = content.replace("<>{(() => { // Get top 3 alternatives", "{(() => { // Get top 3 alternatives", 1)
# The closing </> should be handled by the re.sub above if it was near </ResponsiveContainer>

# Fix for return <></> 
content = content.replace("return <></>", "return <div />")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
