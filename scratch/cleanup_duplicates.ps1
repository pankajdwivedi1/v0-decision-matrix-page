$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# 1. Fix duplicate width={yAxisW} in JSX tags
# Pattern: width={yAxisW} ... width={yAxisW}
# We'll just remove the second occurrence within a small window if it's identical
$content = $content -replace '(width=\{yAxisW\}[^>]*?)\s+width=\{yAxisW\}', '$1'

# 2. Fix Legend wrapperStyle duplicates
# We want to merge the desktop and mobile logic into one property
# width pattern
$content = $content -replace 'width:\s*\((chartSettings\.legendPosition === ''left'' \|\| chartSettings\.legendPosition === ''right'')\)\s*\?\s*"150px"\s*:\s*"max-content",\s*zIndex:\s*50,\s*boxShadow:\s*isMobile\s*\?\s*"none"\s*:\s*"2px 2px 0px rgba\(0,0,0,1\)",\s*display:\s*"flex",\s*justifyContent:\s*"center",\s*whiteSpace:\s*isMobile\s*\?\s*''normal''\s*:\s*''nowrap'',\s*width:\s*isMobile\s*\?\s*''max-content''\s*:\s*''max-content''', 
    'width: isMobile ? "max-content" : (($1) ? "150px" : "max-content"),
                                            zIndex: 50,
                                            boxShadow: isMobile ? "none" : "2px 2px 0px rgba(0,0,0,1)",
                                            display: "flex",
                                            justifyContent: "center",
                                            whiteSpace: isMobile ? ''normal'' : ''nowrap'''

# padding pattern
$content = $content -replace 'padding:\s*"4px 8px",\s*top:\s*(\d+|70),\s*left:\s*(.*),\s*right:\s*(.*),\s*transform:\s*(.*),\s*width:\s*(.*),\s*zIndex:\s*50,\s*boxShadow:\s*(.*),\s*display:\s*"flex",\s*justifyContent:\s*"center",\s*whiteSpace:\s*(.*),\s*maxWidth:\s*(.*),\s*padding:\s*isMobile\s*\?\s*''2px 4px''\s*:\s*''4px 8px''',
    'padding: isMobile ? "2px 4px" : "4px 8px",
                                            top: $1,
                                            left: $2,
                                            right: $3,
                                            transform: $4,
                                            width: $5,
                                            zIndex: 50,
                                            boxShadow: $6,
                                            display: "flex",
                                            justifyContent: "center",
                                            whiteSpace: $7,
                                            maxWidth: $8'

# 3. Specific fix for line 10955 (JSX duplicate width)
$content = $content -replace '(width=\{yAxisRightW\})\s+width=\{yAxisRightW\}', '$1'

$content | Set-Content $path -NoNewline
