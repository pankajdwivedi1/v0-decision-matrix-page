$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# Replace the wide width logic with a tighter fit-content + inline-block version
$oldStyle = 'width: isMobile \? \"max-content\" : \(\(chartSettings\.legendPosition === ''left'' \|\| chartSettings\.legendPosition === ''right''\)\s*\?\s*''150px''\s*:\s*''max-content''\),'
$newStyle = 'width: isMobile ? "max-content" : ((chartSettings.legendPosition === ''left'' || chartSettings.legendPosition === ''right'') ? ''150px'' : ''fit-content''),
                                            display: isMobile ? "flex" : "inline-block",'

$content = $content -replace $oldStyle, $newStyle

$content | Set-Content $path -NoNewline
