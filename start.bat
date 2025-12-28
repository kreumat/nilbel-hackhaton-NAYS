@echo off
echo ========================================
echo   NAYS - Nilufer Akilli Yogunluk Sistemi
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [HATA] Node.js bulunamadi!
    echo Lutfen https://nodejs.org adresinden Node.js yukleyin.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js bulundu
echo.
echo Web sunucusu baslatiliyor...
echo.
echo Tarayicinizda asagidaki adresleri acin:
echo   - Ana Sayfa: http://localhost:3000/main/
echo   - NAYS:      http://localhost:3000/nays/
echo.
echo Durdurmak icin Ctrl+C basin.
echo ========================================
echo.

npx -y serve . -p 3000
