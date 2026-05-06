$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# Remove display: 'flex' and justifyContent: 'center' from Legend wrapperStyle
# These were causing the legend box to stretch unnecessarily on desktop
$content = $content -replace 'display:\s*([''"])flex([''"]),\s*justifyContent:\s*([''"])center([''"]),\s*', ''

$content | Set-Content $path -NoNewline
