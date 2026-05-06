$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# 1. Fix corrupted 'max,' to 'maxWidth'
# It should be maxWidth: isMobile ? 'calc(100% - 10px)' : '95%'
$content = $content -replace 'maxWidth:\s*''95%'',\s*zIndex:\s*50,\s*boxShadow:\s*.*,\s*display:\s*"flex",\s*justifyContent:\s*"center",\s*whiteSpace:\s*isMobile\s*\?\s*''normal''\s*:\s*''nowrap'',\s*max,',
    'maxWidth: isMobile ? "calc(100% - 10px)" : "95%",
                                            zIndex: 50,
                                            boxShadow: isMobile ? "none" : "2px 2px 0px rgba(0,0,0,1)",
                                            display: "flex",
                                            justifyContent: "center",
                                            whiteSpace: isMobile ? ''normal'' : ''nowrap'''

# Fallback for other variants of max,
$content = $content -replace 'max,', 'maxWidth: isMobile ? "calc(100% - 10px)" : "95%",'

# 2. Fix duplicate formatter in Legend
# Pattern: formatter={legendFormatter} ... formatter={legendFormatter}
$content = $content -replace 'formatter=\{legendFormatter\}\s+(wrapperStyle=\{\{.*?\}\})\s+content=\{mobileLegendContent\}\s+formatter=\{legendFormatter\}', '$1 content={mobileLegendContent} formatter={legendFormatter}'

$content | Set-Content $path -NoNewline
