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

if (-not $nodePath) {
    Write-Host "[ERROR] Node.js not found" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

try {
    $tsxPath = "node_modules\tsx\dist\cli.mjs"
    if (Test-Path $tsxPath) {
        & $nodePath $tsxPath api/server.ts
    } else {
        Write-Host "[ERROR] tsx not found at: $tsxPath" -ForegroundColor Red
        pause
        exit 1
    }
} catch {
    Write-Host "[ERROR] Failed to start: $_" -ForegroundColor Red
    pause
    exit 1
}
