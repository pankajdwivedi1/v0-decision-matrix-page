# PowerShell script to convert Markdown to Word with academic formatting
# Requires: pandoc (will check and provide installation instructions if missing)

$markdownFile = "Decisionalgo_Research_Paper.md"
$outputFile = "Decisionalgo_Research_Paper.docx"
$referenceDoc = "reference_template.docx" # Optional: custom template

Write-Host "Converting Markdown to Word Document..." -ForegroundColor Cyan

# Check if pandoc is installed
$pandocInstalled = Get-Command pandoc -ErrorAction SilentlyContinue

if (-not $pandocInstalled) {
    Write-Host "`nPandoc is not installed. Installing via winget..." -ForegroundColor Yellow
    
    try {
        winget install --id JohnMacFarlane.Pandoc -e --source winget
        Write-Host "Pandoc installed successfully!" -ForegroundColor Green
        Write-Host "Please restart PowerShell and run this script again." -ForegroundColor Yellow
        exit
    }
    catch {
        Write-Host "`nFailed to install pandoc automatically." -ForegroundColor Red
        Write-Host "`nPlease install pandoc manually:" -ForegroundColor Yellow
        Write-Host "1. Visit: https://pandoc.org/installing.html" -ForegroundColor White
        Write-Host "2. Download and install Pandoc for Windows" -ForegroundColor White
        Write-Host "3. Run this script again" -ForegroundColor White
        exit
    }
}

# Convert using pandoc with academic styling
Write-Host "`nConverting file..." -ForegroundColor Cyan

$pandocArgs = @(
    $markdownFile,
    "-o", $outputFile,
    "--from=markdown",
    "--to=docx",
    "--columns=2",  # Two-column layout
    "--standalone",
    "--toc",  # Table of contents
    "--number-sections",  # Number the sections
    "--highlight-style=tango",
    "--metadata", "title=Decision Algo Research Paper",
    "--metadata", "author=Pankaj Prasad Dwivedi"
)

# If reference template exists, use it
if (Test-Path $referenceDoc) {
    $pandocArgs += "--reference-doc=$referenceDoc"
    Write-Host "Using custom reference template..." -ForegroundColor Green
}

try {
    & pandoc @pandocArgs
    
    if (Test-Path $outputFile) {
        Write-Host "`nSuccess! Word document created: $outputFile" -ForegroundColor Green
        Write-Host "`nOpening the document..." -ForegroundColor Cyan
        Start-Process $outputFile
    }
    else {
        Write-Host "`nConversion completed but file not found." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "`nError during conversion: $_" -ForegroundColor Red
    Write-Host "`nTrying alternative method without columns..." -ForegroundColor Yellow
    
    # Fallback: convert without columns
    pandoc $markdownFile -o $outputFile --standalone --toc --number-sections
    
    if (Test-Path $outputFile) {
        Write-Host "`nWord document created (single column): $outputFile" -ForegroundColor Green
        Write-Host "You can manually set to two-column layout in Word:" -ForegroundColor Yellow
        Write-Host "  Layout > Columns > Two" -ForegroundColor White
        Start-Process $outputFile
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
