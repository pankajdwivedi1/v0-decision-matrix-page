$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$c = Get-Content $path
$c[10914] = "" 
$c | Set-Content $path
