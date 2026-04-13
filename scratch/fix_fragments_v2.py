
import os
import re

file_path = r'c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_next_closing_fragment = 0

for i, line in enumerate(lines):
    # If we find a ResponsiveContainer followed by a fragment on the next line
    if '<ResponsiveContainer' in line:
        new_lines.append(line)
        # Check next line for fragment
        if i + 1 < len(lines):
            next_line = lines[i+1]
            if '<>' in next_line:
                # Remove the fragment from this line
                fixed_next = next_line.replace('<>', '')
                new_lines.append(fixed_next)
                # We need to find the matching closing fragment
                # This is tricky without a full parser, but usually it's at the end of the next block
                skip_next_closing_fragment += 1
                # We'll handle the closing tag by a separate pass or logic
                # For now let's just mark the current line processed
                lines[i+1] = "" # Mark as processed
        continue
    
    if line == "": # Skip already processed lines
        continue

    # If we are looking for a closing fragment and it's near a closing ResponsiveContainer
    if skip_next_closing_fragment > 0 and '</>' in line:
        # Check if </ResponsiveContainer> is coming up soon
        # Or if the indentation matches the opening fragment
        # For simplicity in this script, we'll just remove the next few </> we find
        # but only if they are on a line by themselves or followed by </ResponsiveContainer>
        if '</ResponsiveContainer>' in "".join(lines[i:i+5]):
            line = line.replace('</>', '')
            skip_next_closing_fragment -= 1
    
    new_lines.append(line)

# Second pass for more specific replacements if needed
content = "".join(new_lines)
content = content.replace("return <></>", "return <div />")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
