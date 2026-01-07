$ErrorActionPreference = "Stop"

Write-Host "Поиск Node.js..." -ForegroundColor Yellow

# Поиск Node.js в стандартных папках
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
        Write-Host "✓ Node.js найден: $nodePath" -ForegroundColor Green
        break
    }
}

if (-not $nodePath) {
    Write-Host "✗ Node.js не найден в стандартных папках" -ForegroundColor Red
    Write-Host ""
    Write-Host "Пожалуйста, установите Node.js с https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

# Запуск tsx
Write-Host ""
Write-Host "Запуск backend сервера..." -ForegroundColor Yellow
Write-Host "Сервер будет доступен по адресу: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow
Write-Host ""

try {
    $tsxPath = "node_modules\.bin\tsx.cmd"
    if (Test-Path $tsxPath) {
        & $nodePath node_modules\.bin\tsx.cmd api/server.ts
    } else {
        Write-Host "✗ tsx не найден! Запустите: npm install --legacy-peer-deps" -ForegroundColor Red
        pause
        exit 1
    }
} catch {
    Write-Host "✗ Ошибка запуска: $_" -ForegroundColor Red
    pause
    exit 1
}
