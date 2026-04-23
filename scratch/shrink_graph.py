FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# Find and update layout constants in case scientific
for i in range(7300, 7400):
    if 'const svgW   =' in lines[i]:
        lines[i] = '                                    const svgW   = 540;\n'
    if 'const svgH   =' in lines[i]:
        lines[i] = '                                    const svgH   = 540;\n'
    if 'const cx     =' in lines[i]:
        lines[i] = '                                    const cx     = 270;\n'
    if 'const cy     =' in lines[i]:
        lines[i] = '                                    const cy     = 270;\n'
    if 'const outerR =' in lines[i]:
        lines[i] = '                                    const outerR = 210;\n'

# Update SVG to not be width 100% fixed, but have a max-width
for i in range(7400, 7450):
    if '<svg' in lines[i] and 'viewBox' in lines[i]:
        lines[i] = lines[i].replace('width="100%"', 'width="540" height="540" className="max-w-full h-auto"')

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(lines)
