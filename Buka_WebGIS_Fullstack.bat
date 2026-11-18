@echo off
title Launcher WebGIS Karhutla Fullstack Modern
color 0B

echo ======================================================================
echo    SISTEM MONITORING KARHUTLA KALIMANTAN (FULLSTACK MODERN)
echo    Frontend: Next.js (React) + Tailwind CSS (Port 3001)
echo    Backend : Python (Django) + GraphQL (Port 8000)
echo    Database: PostgreSQL 18 + PostGIS
echo    Map Svc : GeoServer (Java GWC WMS) (Port 8080)
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa dependensi Python dan Node.js...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak ditemukan di PATH.
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di PATH.
    pause
    exit /b 1
)

echo [2/3] Menjalankan Backend Django GraphQL (Port 8000)...
start "Backend: Django GraphQL" cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

echo [3/3] Menjalankan Frontend Next.js + Tailwind (Port 3001)...
start "Frontend: Next.js" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [OK] Membuka WebGIS Fullstack di browser default...
start http://localhost:3001

echo.
echo ======================================================================
echo  Aplikasi Fullstack Aktif:
echo  - Frontend Next.js : http://localhost:3001
echo  - GraphQL API      : http://localhost:8000/graphql (GraphiQL GUI)
echo  - GeoServer WMS GWC: http://localhost:8080/geoserver
echo ======================================================================
exit /b 0
