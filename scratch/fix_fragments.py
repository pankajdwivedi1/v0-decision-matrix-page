
import os

file_path = r'c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: <>{sensitivityChartType ...
# We'll use a regex-ish replacement or just find and replace the specific strings
# To be safe, we'll replace the first occurrence after line 7650

search1 = "<>{sensitivityChartType === 'radar' ?"
if search1 in content:
    print("Found search1")
    content = content.replace(search1, "{sensitivityChartType === 'radar' ?", 1)

# Fix 2: matching </> for the sensitivity chart
# It's followed by </ResponsiveContainer>
search2 = " </>\n                                </ResponsiveContainer>"
# Since whitespace is the issue, let's use a more flexible approach
import re
content = re.sub(r'</>\s+</ResponsiveContainer>', r'</ResponsiveContainer>', content)

# Fix 3: empty fragments in boxPlot
content = content.replace("return <></>", "return <div />")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
