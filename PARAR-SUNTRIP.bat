@echo off
echo A parar SunTrip...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
echo Portas 3000 e 5000 libertadas.
timeout /t 2 >nul
