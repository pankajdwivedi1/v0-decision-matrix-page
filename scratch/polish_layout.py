FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

for i in range(7300, 7600):
    # 1. Ranking lines stroke width
    if 'strokeWidth={chartSettings.borderWidth + 1}' in lines[i]:
        lines[i] = lines[i].replace('chartSettings.borderWidth + 1', 'chartSettings.borderWidth + 2.2')
    
    # 2. Legend position / margins
    if 'className="bg-white border-2 border-black p-1 mb-2"' in lines[i]:
        lines[i] = lines[i].replace('mb-2', 'mb-0')
    if "style={{ width: '96%', margin: '8px auto 6px'" in lines[i]:
        lines[i] = lines[i].replace("margin: '8px auto 6px'", "margin: '4px auto 0'")

    # 3. Tighten SVG height
    if 'const svgH   = 860;' in lines[i]:
        lines[i] = lines[i].replace('860', '700')
    if 'const cy     = svgH / 2 + 20;' in lines[i]:
        lines[i] = lines[i].replace('svgH / 2 + 20', '340')

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(lines)
