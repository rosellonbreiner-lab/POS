@echo off
setlocal
title MotoTaller - Sistema de Gestion

echo ============================================================
echo           MOTOTALLER - SISTEMA DE GESTION
echo       (Inventario, Ventas POS, Taller y Contabilidad)
echo ============================================================
echo.

cd /d "%~dp0"

:: 1. Crear archivo .env si no existe
if not exist ".env" (
    echo [*] Creando archivo de configuracion .env...
    copy ".env.example" ".env" >nul 2>nul
)

:: 2. Crear carpeta de uploads
if not exist "uploads" (
    mkdir "uploads" >nul 2>nul
)

:: 3. Verificar Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor instale Node.js desde https://nodejs.org
    pause
    exit /b 1
)

:: 4. Generar cliente de Prisma
echo [*] Sincronizando modelo de datos...
call npx prisma generate

:: 5. Abrir navegador
echo [*] Abriendo navegador en http://localhost:3000 ...
start http://localhost:3000

:: 6. Iniciar servidor Next.js
echo.
echo ============================================================
echo   Servidor iniciado en http://localhost:3000
echo   No cierre esta ventana mientras use el sistema.
echo ============================================================
echo.
call npm run dev

pause

