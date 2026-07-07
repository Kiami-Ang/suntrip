@echo off
title SunTrip - Modo rapido (desenvolvimento)
set "NODE=C:\Program Files\nodejs"
set "PATH=%NODE%;%PATH%"
set "ROOT=%~dp0"

call "%ROOT%PARAR-SUNTRIP.bat"

start "SunTrip API" cmd /k "cd /d "%ROOT%server" && npm run dev"
timeout /t 4 /nobreak >nul
start "SunTrip Site" cmd /k "cd /d "%ROOT%client" && npm run dev"
timeout /t 10 /nobreak >nul
start http://localhost:3000
echo Abra http://localhost:3000
pause
