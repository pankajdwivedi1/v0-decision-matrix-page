lines = open('app/application/page.tsx', encoding='utf-8').readlines()
target = 'case "stackedBar"'
for i in range(7300, 7600):
    if target in lines[i]:
        print(f'Next case line {i+1}:', repr(lines[i]))
        print(f'Line {i}:', repr(lines[i-1]))
        print(f'Line {i-1}:', repr(lines[i-2]))
        break
