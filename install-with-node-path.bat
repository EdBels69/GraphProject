@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Graph Analyser - Installation
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/4] Searching for Node.js...
echo.

REM Search for Node.js in standard paths
set NODE_PATH=
set NPM_PATH=
for %%p in (
    "%ProgramFiles%\nodejs\node.exe"
    "%ProgramFiles(x86)%\nodejs\node.exe"
    "%LOCALAPPDATA%\Programs\nodejs\node.exe"
    "%APPDATA%\npm\node.exe"
    "%USERPROFILE%\AppData\Roaming\npm\node.exe"
    "%USERPROFILE%\AppData\Local\Programs\nodejs\node.exe"
) do (
    if exist "%%~p" (
        set NODE_PATH=%%~p
        set NPM_PATH=%%~dpnpm.cmd
        echo [OK] Node.js found: !NODE_PATH!
        echo [OK] npm found: !NPM_PATH!
        goto :found_node
    )
)

echo [ERROR] Node.js not found in standard paths
echo.
echo Please install Node.js from https://nodejs.org/
echo.
pause
exit /b 1

:found_node
echo.
echo [2/4] Setting up environment...
echo.

REM Create temporary npm config with full path to node
set NPM_CONFIG_NODEJS=!NODE_PATH!

echo [3/4] Installing dependencies...
echo This may take 2-5 minutes...
echo.

REM Install dependencies using npm with full node path
"!NPM_PATH!" install --legacy-peer-deps --scripts-prepend-node-path="!NODE_PATH!"

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Possible reasons:
    echo 1. Visual Studio Build Tools not installed
    echo 2. Network issues
    echo.
    echo Solution:
    echo Install Visual Studio Build Tools from:
    echo https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencies installed!
echo.
echo [4/4] Next steps:
echo.
echo To start backend server, run:
echo   npm run dev:backend
echo.
echo Or to start everything (frontend + backend):
echo   npm run dev
echo.
pause
