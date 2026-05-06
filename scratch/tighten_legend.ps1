$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# Update Legend wrapperStyle to use inline-block and fit-content for tighter boxing
$content = $content -replace 'width: isMobile \? \"max-content\" : \(\(chartSettings\.legendPosition === ''left'' \|\| chartSettings\.legendPosition === ''right''\\) \? ''150px'' : ''max-content''\)', 
    'width: isMobile ? "max-content" : ((chartSettings.legendPosition === ''left'' || chartSettings.legendPosition === ''right'') ? ''150px'' : ''fit-content''),
                                            display: isMobile ? "flex" : "inline-block"'

$content | Set-Content $path -NoNewline
