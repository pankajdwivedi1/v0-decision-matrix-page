$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$lines = Get-Content $path
$newLines = New-Object System.Collections.Generic.List[string]

$inStyle = $false
$seenProps = New-Object System.Collections.Generic.HashSet[string]

foreach ($line in $lines) {
    if ($line -match 'wrapperStyle=\{\{') {
        $inStyle = $true
        $seenProps.Clear()
        $newLines.Add($line)
        continue
    }
    
    if ($inStyle) {
        if ($line -match '\}\}') {
            $inStyle = $false
            $newLines.Add($line)
            continue
        }
        
        # Check for property definition
        if ($line -match '^\s*([a-zA-Z0-9]+):\s*(.*?),?\s*$') {
            $propName = $matches[1]
            if ($seenProps.Contains($propName)) {
                # Duplicate! Skip this line.
                continue
            }
            $seenProps.Add($propName) | Out-Null
        }
    }
    
    $newLines.Add($line)
}

$newLines | Set-Content $path
