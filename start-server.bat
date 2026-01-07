@echo off
echo Starting Graph Analyser Backend Server...
cd /d "%~dp0"
call node_modules\.bin\tsx.cmd api/server.ts
pause
