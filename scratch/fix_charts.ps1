$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path

# YAxis widths
$linesToUpdate = @(10036, 10119, 10216, 10316, 10436, 10537, 10750, 10894)
foreach ($ln in $linesToUpdate) {
    if ($content[$ln] -like "*domain=*") {
        $indent = $content[$ln].Substring(0, $content[$ln].IndexOf("domain"))
        $content[$ln] = $indent + "width={yAxisW}" + "`r`n" + $content[$ln]
    }
}

# Legend border and shadow
$content = $content -replace 'border: `\$\{chartSettings.borderWidth\}px solid \$\{theme.border\}`', 'border: isMobile ? "none" : `${chartSettings.borderWidth}px solid ${theme.border}`'
$content = $content -replace 'boxShadow: "2px 2px 0px rgba\(0,0,0,1\)"', 'boxShadow: isMobile ? "none" : "2px 2px 0px rgba(0,0,0,1)"'

$content | Set-Content $path
