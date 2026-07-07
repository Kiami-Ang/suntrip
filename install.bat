@echo off
title SunTrip - Instalar dependencias
cd /d "%~dp0"

set "NODE=C:\Program Files\nodejs"
set "PATH=%NODE%;%PATH%"

if not exist "%NODE%\npm.cmd" (
  echo.
  echo ERRO: Node.js nao esta instalado.
  echo Descarregue em: https://nodejs.org  (versao LTS)
  echo.
  pause
  exit /b 1
)

echo Node:
node -v
echo npm:
call npm -v
echo.

echo [1/3] Servidor...
cd server
call npm install
if errorlevel 1 goto erro
echo.

echo [2/3] Site...
cd ..\client
call npm install
if errorlevel 1 goto erro
echo.

echo [3/3] Utilizadores demo...
cd ..\server
call npm run seed
echo.

echo ========================================
echo   Instalacao concluida!
echo   Execute: start-suntrip.bat
echo ========================================
pause
exit /b 0

:erro
echo.
echo Falha na instalacao. Verifique a mensagem acima.
pause
exit /b 1
