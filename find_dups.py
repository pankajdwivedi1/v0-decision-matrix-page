import re
with open('c:/Users/PANKAJ DWIVEDI/Desktop/decisionalgo/app/application/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
keys = re.findall(r'assetKey=[\'"]([^\'"]+)[\'"]', text)
counts = {}
for k in keys:
    counts[k] = counts.get(k, 0) + 1
with open('c:/Users/PANKAJ DWIVEDI/Desktop/decisionalgo/duplicates.txt', 'w', encoding='utf-8') as f:
    for k, v in counts.items():
        if v > 1:
            f.write(f'{k}: {v}\n')
