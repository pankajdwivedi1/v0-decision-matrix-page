
import re

file_path = r'c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<ResponsiveContainer' in line:
        print(f"Line {i+1}: {line.strip()}")
        # Check the next non-empty line
        for j in range(i + 1, min(i + 10, len(lines))):
            next_line = lines[j].strip()
            if next_line:
                print(f"  Next child: {next_line}")
                break
