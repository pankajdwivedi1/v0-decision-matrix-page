$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$text = [System.IO.File]::ReadAllText($path)

# 1. Fix the double-YAxis line
$target1 = '<YAxis                                            label={chartSettings.showAxisTitles ? { value: chartSettings.yAxisTitle, angle: -90, position: ''insideLeft'', offset: chartSettings.yAxisOffset, style: { fontSize: chartSettings.fontSize + 1, fontStyle: ''italic'', fill: theme.text } } : undefined}                                            width={yAxisW}'
$replace1 = '<YAxis`r`n                                           label={chartSettings.showAxisTitles ? { value: chartSettings.yAxisTitle, angle: -90, position: ''insideLeft'', offset: chartSettings.yAxisOffset, style: { fontSize: chartSettings.fontSize + 1, fontStyle: ''italic'', fill: theme.text } } : undefined}`r`n                                           width={yAxisW}'
$text = $text.Replace($target1, $replace1)

# 2. Fix the redundant width line with broken tag
$target2 = '                                           width={yAxisW}`r`n                                          <YAxis                                            width={yAxisW}'
$replace2 = ''
$text = $text.Replace($target2, $replace2)

# 3. Fix the XAxis redundant width
$target3 = 'position: ''insideBottom'', offset: chartSettings.xAxisOffset, style: { fontSize: chartSettings.fontSize + 1, fontStyle: ''italic'', fill: theme.text } } : undefined} />`r`n                                           width={yAxisW}'
$replace3 = 'position: ''insideBottom'', offset: chartSettings.xAxisOffset, style: { fontSize: chartSettings.fontSize + 1, fontStyle: ''italic'', fill: theme.text } } : undefined} />'
$text = $text.Replace($target3, $replace3)

[System.IO.File]::WriteAllText($path, $text)
