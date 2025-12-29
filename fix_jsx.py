import sys

file_path = r'c:\Users\PANKAJ DWIVEDI\OneDrive\Desktop\v0-decision-matrix-page\app\application\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 4464 (1-indexed) is lines[4463]
# Line 4483 (1-indexed) is lines[4482]

if '{' in lines[4463]:
    lines[4463] = lines[4463].replace('{', '')
if '}' in lines[4482]:
    lines[4482] = lines[4482].replace('}', '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Updated lines 4464 and 4483")
