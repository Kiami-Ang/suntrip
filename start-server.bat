@echo off
title SunTrip API - Porta 5000
cd /d "%~dp0server"

set "NODE=C:\Program Files\nodejs"
if not exist "%NODE%\npm.cmd" (
  echo ERRO: Node.js nao encontrado em C:\Program Files\nodejs
  echo Instale em https://nodejs.org
  pause
  exit /b 1
)

set "PATH=%NODE%;%PATH%"

if not exist "node_modules\" (
  echo A instalar dependencias do servidor...
  call npm install
)

echo.
echo ========================================
echo   SunTrip API - http://localhost:5000
echo   Rede: http://192.168.1.123:5000
echo ========================================
echo   NAO FECHE ESTA JANELA
echo ========================================
echo.

call npm run dev
pause
