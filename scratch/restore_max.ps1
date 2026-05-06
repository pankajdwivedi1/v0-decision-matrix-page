$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$c = Get-Content $path -Raw
$badString = 'maxWidth: isMobile ? "calc(100% - 10px)" : "95%",'
$c = $c.Replace($badString, 'max,')
$c | Set-Content $path -NoNewline
