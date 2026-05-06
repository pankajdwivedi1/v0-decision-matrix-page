$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path

# Fix Line Chart YAxis (10896)
$ln = 10895
if ($content[$ln] -like "*reversed*") {
    $indent = "                                         "
    $newLines = @(
        $indent + "<YAxis",
        $indent + "  label={chartSettings.showAxisTitles ? { value: chartSettings.yAxisTitle, angle: -90, position: 'insideLeft', offset: chartSettings.yAxisOffset, style: { fontSize: chartSettings.fontSize + 1, fontStyle: 'italic', fill: theme.text } } : undefined}",
        $indent + "  width={yAxisW}"
    )
    $content[$ln] = ($newLines -join "`r`n") + "`r`n" + $content[$ln]
}

# Also ensure Stacked Bar and Stacked Area have width
for ($i=10000; $i -lt 11000; $i++) {
    if ($content[$i] -like "*label={chartSettings.showAxisTitles*" -and $content[$i+1] -notlike "*width={yAxisW}*") {
        $indent = $content[$i].Substring(0, $content[$i].IndexOf("label"))
        $content[$i] = $content[$i] + "`r`n" + $indent + "width={yAxisW}"
    }
}

$content | Set-Content $path
