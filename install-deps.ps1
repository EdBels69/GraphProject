$ErrorActionPreference = "Stop"

Write-Host "Searching for Node.js..." -ForegroundColor Yellow

$possiblePaths = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:USERPROFILE\AppData\Roaming\npm\node.exe",
    "$env:USERPROFILE\AppData\Local\Programs\nodejs\node.exe"
)

$nodePath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $nodePath = $path
        Write-Host "[OK] Node.js found: $nodePath" -ForegroundColor Green
        break
    }
}

$npmPath = $nodePath -replace "node.exe", "npm.cmd"

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan
Write-Host ""

try {
    & $npmPath install --legacy-peer-deps
    Write-Host ""
    Write-Host "[SUCCESS] Dependencies installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can run the server with:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy Bypass -File start-server-v2.ps1" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Failed to install: $_" -ForegroundColor Red
    pause
    exit 1
}
