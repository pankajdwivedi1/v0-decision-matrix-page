lines = open('app/application/page.tsx', encoding='utf-8').readlines()
target = 'case "stackedBar"'
for i in range(7300, len(lines)):
    if target in lines[i]:
        print(f"CASE_START: 7300")
        print(f"CASE_END: {i-1}")
        print(f"NEXT_CASE: {i}")
        break
