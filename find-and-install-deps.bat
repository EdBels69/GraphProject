@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Graph Analyser - Installation
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/3] Searching for npm...
echo.

REM Search for npm in standard paths
set NPM_PATH=
for %%p in (
    "%ProgramFiles%\nodejs\npm.cmd"
    "%ProgramFiles(x86)%\nodejs\npm.cmd"
    "%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
    "%APPDATA%\npm\npm.cmd"
    "%USERPROFILE%\AppData\Roaming\npm\npm.cmd"
    "%USERPROFILE%\AppData\Local\Programs\nodejs\npm.cmd"
) do (
    if exist "%%~p" (
        set NPM_PATH=%%~p
        echo [OK] npm found: !NPM_PATH!
        goto :found_npm
    )
)

echo [ERROR] npm not found in standard paths
echo.
echo Please install Node.js from https://nodejs.org/
echo.
pause
exit /b 1

:found_npm
echo.
echo [2/3] Installing dependencies...
echo This may take 2-5 minutes...
echo.

"!NPM_PATH!" install --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencies installed!
echo.
echo [3/3] Next steps:
echo.
echo To start the backend server, run:
echo   npm run dev:backend
echo.
echo Or to start everything (frontend + backend):
echo   npm run dev
echo.
pause
