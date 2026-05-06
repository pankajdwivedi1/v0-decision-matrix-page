$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$c = Get-Content $path
$c[10894] = "" 
$c[10904] = "                                         <YAxis"
$c[10905] = "                                           label={chartSettings.showAxisTitles ? { value: chartSettings.yAxisTitle, angle: -90, position: 'insideLeft', offset: chartSettings.yAxisOffset, style: { fontSize: chartSettings.fontSize + 1, fontStyle: 'italic', fill: theme.text } } : undefined}"
$c[10906] = "                                           width={yAxisW}"
$c[10907] = "                                           reversed"
$c | Set-Content $path
