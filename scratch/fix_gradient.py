lines = open('app/application/page.tsx', encoding='utf-8').readlines()
old = lines[7349]
print('Old:', repr(old))
new = '                                                 <radialGradient key={`grad-${alt}`} id={`rgrad-${altIdx}`} cx={centerX} cy={centerY} r={maxRad} gradientUnits="userSpaceOnUse" fx={centerX} fy={centerY}>\n'
lines[7349] = new
open('app/application/page.tsx', 'w', encoding='utf-8').writelines(lines)
print('Fixed. New:', repr(lines[7349]))
