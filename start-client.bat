@echo off
title SunTrip Site - Porta 3000
cd /d "%~dp0client"

set "NODE=C:\Program Files\nodejs"
if not exist "%NODE%\npm.cmd" (
  echo ERRO: Node.js nao encontrado em C:\Program Files\nodejs
  echo Instale em https://nodejs.org
  pause
  exit /b 1
)

set "PATH=%NODE%;%PATH%"

if not exist "node_modules\" (
  echo A instalar dependencias do site...
  call npm install
)

echo.
echo ========================================
echo   SunTrip Site
echo   PC:       http://localhost:3000
echo   Telemovel: http://192.168.1.123:3000
echo ========================================
echo   NAO FECHE ESTA JANELA
echo ========================================
echo.

call npm run dev
pause
