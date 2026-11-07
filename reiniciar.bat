@echo off
setlocal
title MotoTaller - Reinicio de Servicios

echo ============================================================
echo         MOTOTALLER - REINICIO DE SERVICIOS
echo ============================================================
echo.

cd /d "%~dp0"

echo [*] Liberando puerto 3000 y cerrando instancias anteriores...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"

timeout /t 2 /nobreak >nul

echo [*] Iniciando servicios de nuevo...
call start.bat

