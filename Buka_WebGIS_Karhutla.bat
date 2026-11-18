@echo off
title Launcher WebGIS Karhutla Kalimantan
color 0A

echo ================================================================
echo    SISTEM MONITORING KARHUTLA PULAU KALIMANTAN (WEBGIS OGC)
echo    Penginderaan Jauh & SIG - Universitas Hasanuddin
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/2] Memeriksa dependensi dan server lokal...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di PATH sistem.
    echo Harap instal Node.js terlebih dahulu.
    pause
    exit /b 1
)

echo [2/2] Memulai Server WebGIS & Proxy GeoServer (Port 3000)...
start "WebGIS Server (Port 3000)" cmd /k "node server.js"

timeout /t 2 /nobreak >nul

echo [OK] Membuka WebGIS di browser default...
start http://localhost:3000

echo.
echo ================================================================
echo Aplikasi telah berjalan di http://localhost:3000
echo GeoServer Proxy siap di http://localhost:3000/geoserver
echo Jangan menutup jendela server Node.js selama menggunakan peta!
echo ================================================================
exit /b 0
