$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path

# Fix the broken Line Chart block
$newContent = @()
foreach ($line in $content) {
    if ($line -like "*<YAxis<YAxis label=*") {
        # This is the merged line 10905
        $indent = "                                         "
        $newContent += $indent + "<YAxis"
        $newContent += $indent + "  label={chartSettings.showAxisTitles ? { value: chartSettings.yAxisTitle, angle: -90, position: 'insideLeft', offset: chartSettings.yAxisOffset, style: { fontSize: chartSettings.fontSize + 1, fontStyle: 'italic', fill: theme.text } } : undefined}"
        $newContent += $indent + "  width={yAxisW}"
    } elseif ($line -like "*<YAxis width={yAxisW}*" -and $line -notlike "*label=*") {
        # This is the broken line 10907
        # Skip it, it's redundant
    } elseif ($line -like "*label={chartSettings.showAxisTitles*position: 'insideBottom'*" -and ($content[$content.IndexOf($line)+1] -like "*width={yAxisW}*")) {
        # This is the redundant width on XAxis (line 10895)
        $newContent += $line
        # The NEXT line is the width, we skip it by setting a flag?
        # Simpler: just replace the specific broken pattern
    } else {
        $newContent += $line
    }
}

# Final cleanup of the redundant width at 10895
$finalContent = @()
for ($i=0; $i -lt $newContent.Count; $i++) {
    if ($newContent[$i] -like "*label={chartSettings.showAxisTitles*position: 'insideBottom'*" -and $newContent[$i+1] -like "*width={yAxisW}*") {
        $finalContent += $newContent[$i]
        $i++ # skip the width line
    } else {
        $finalContent += $newContent[$i]
    }
}

$finalContent | Set-Content $path
