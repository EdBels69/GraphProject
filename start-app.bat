@echo off
setlocal

echo ========================================
echo   Graph Analyser - Запуск сервера
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/3] Проверка node.js...
if exist "node_modules\.bin\tsx.cmd" (
    echo ✓ tsx найден
) else (
    echo ✗ tsx не найден! Установите зависимости: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo [2/3] Запуск backend сервера...
echo Сервер будет доступен по адресу: http://localhost:3001
echo Для остановки нажмите Ctrl+C
echo.

call node_modules\.bin\tsx.cmd api/server.ts

if errorlevel 1 (
    echo.
    echo ✗ Ошибка запуска сервера
    pause
    exit /b 1
)

endlocal
