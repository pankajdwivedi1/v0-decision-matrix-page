$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# 1. Fix dynamicmax -> dynamicMax
$content = $content -replace 'dynamicmax', 'dynamicMax'

# 2. Fix Legend max, -> responsive maxWidth
# We only target "max," that is indented by at least 30 spaces and followed by zIndex or displayed within a wrapperStyle block
$content = $content -replace '(\s{30,})max,', '$1maxWidth: isMobile ? "calc(100% - 10px)" : "95%",'

$content | Set-Content $path -NoNewline
