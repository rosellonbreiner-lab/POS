@echo off
setlocal enabledelayedexpansion
title MotoTaller - Sistema de Gestion POS

echo ============================================================
echo           MOTOTALLER - SISTEMA DE GESTION POS
echo       (Inventario, Ventas POS, Taller y Contabilidad)
echo ============================================================
echo.

cd /d "%~dp0"

REM 1. Crear archivo .env si no existe
if not exist ".env" (
    echo [*] Creando archivo de configuracion .env
    copy ".env.example" ".env" >nul 2>nul
)

REM 2. Crear carpeta de uploads si no existe
if not exist "uploads" (
    mkdir "uploads" >nul 2>nul
)

REM 3. Verificar que Node.js este instalado
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor instale Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM 4. Detectar la direccion IP local de la conexion actual
set LOCAL_IP=127.0.0.1
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' }).IPAddress | Select-Object -First 1"') do (
    set LOCAL_IP=%%i
)

REM 5. Verificar si el servidor ya esta en ejecucion en el puerto 3000
set SERVER_RUNNING=0
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { '1' } else { '0' }"') do (
    set SERVER_RUNNING=%%i
)

if "!SERVER_RUNNING!"=="1" (
    echo [OK] El servidor ya se encuentra ACTIVO y listo para usar.
    echo.
    echo ============================================================
    echo   Direcciones de Acceso al Sistema:
    echo   * En esta computadora: https://localhost:3000
    echo   * Desde tu celular Android / Red Wi-Fi: https://!LOCAL_IP!:3000
    echo ============================================================
    echo.
    echo [*] Abriendo la aplicacion en tu navegador
    start https://localhost:3000
    echo.
    echo Presione cualquier tecla para cerrar esta ventana
    pause >nul
    exit /b 0
)

REM 6. Sincronizar Prisma
echo [*] Sincronizando modelo de base de datos
call npx prisma generate >nul 2>&1

REM 7. Informar direcciones de conexion
echo.
echo ============================================================
echo   Iniciando Servidor Seguro (HTTPS)
echo   * Acceso en esta computadora: https://localhost:3000
echo   * Acceso en celular Android / Wi-Fi: https://!LOCAL_IP!:3000
echo ============================================================
echo.

REM 8. Abrir navegador en HTTPS
echo [*] Abriendo navegador
start https://localhost:3000

REM 9. Ejecutar servidor
call npm run dev

pause
