import re

with open('app/application/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_search = text.find('{(homeTab')
end_search = text.rfind('</SidebarProvider>')

if start_search == -1 or end_search == -1:
    print("Could not find start/end")

middle = text[start_search:end_search]

# Let's see the structure of CardHeader
headers = []
for match in re.finditer(r'<CardHeade(.*?)>(.*?)</CardHeader>', middle, re.DOTALL):
    headers.append(match.group(0))
    
print(f"Found {len(headers)} CardHeaders")
if len(headers) > 0:
    print("Example CardHeader:\n", headers[0][:300])

