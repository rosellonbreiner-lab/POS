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

REM 4. Sincronizar Prisma si hace falta
echo [*] Sincronizando modelo de base de datos...
call npx prisma generate >nul 2>&1

REM 5. Generar o verificar certificados SSL locales
call node scripts/generate-cert.mjs >nul 2>&1

REM 6. Iniciar Servidor y Tunel Seguro Cloudflare
call node scripts/start-all.mjs

pause
