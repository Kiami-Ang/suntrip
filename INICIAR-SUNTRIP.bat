@echo off
chcp 65001 >nul
title SunTrip
set "NODE=C:\Program Files\nodejs"
set "PATH=%NODE%;%PATH%"
set "ROOT=%~dp0"

echo.
echo  SunTrip - A iniciar...
echo.

if not exist "%NODE%\node.exe" (
  echo Instale Node.js: https://nodejs.org
  pause
  exit /b 1
)

echo A libertar portas 3000 e 5000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
timeout /t 2 /nobreak >nul

start "SunTrip API - NAO FECHAR" cmd /k "cd /d "%ROOT%server" && npm run dev"
timeout /t 4 /nobreak >nul
start "SunTrip Site - NAO FECHAR" cmd /k "cd /d "%ROOT%client" && npm run dev"
timeout /t 10 /nobreak >nul

echo.
echo  PC:        http://localhost:3000
echo  Telemovel: http://192.168.1.123:3000
echo  API:       http://localhost:5000/api/health
echo.
echo  demo@suntrip.ao / demo123
echo.

start http://localhost:3000
pause
