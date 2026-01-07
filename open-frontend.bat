@echo off
echo ========================================
echo   Graph Analyser - Open Frontend
echo ========================================
echo.
echo Opening the frontend in your browser...
echo.

set HTML_FILE=%~dp0dist\index.html

if exist "%HTML_FILE%" (
    start "" "%HTML_FILE%"
    echo [OK] Frontend opened!
    echo.
    echo NOTE: Some features require backend server.
    echo To run the full application, you need to:
    echo 1. Install Visual Studio Build Tools
    echo 2. Run: install-with-node-path.bat
    echo 3. Run: start-server.bat
) else (
    echo [ERROR] dist\index.html not found!
)

echo.
pause
