@echo off
echo ========================================
echo   NAYS ML - Kisi Sayma Modulu
echo ========================================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [HATA] Python bulunamadi!
    echo Lutfen https://python.org adresinden Python 3.10+ yukleyin.
    echo Kurulum sirasinda "Add Python to PATH" secenegini isaretleyin!
    echo.
    pause
    exit /b 1
)

echo [OK] Python bulundu
echo.

REM Navigate to nays-ml folder
cd /d "%~dp0nays-ml"

REM Check if venv exists
if not exist "venv" (
    echo Virtual environment olusturuluyor...
    python -m venv venv
    echo.
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install requirements
echo Gerekli paketler yukleniyor (ilk seferde biraz zaman alabilir)...
pip install -r requirements.txt -q

echo.
echo ========================================
echo Kurulum tamamlandi!
echo.
echo Kullanim:
echo   Kamera ile:  python main.py
echo   Video ile:   python test.py
echo.
echo Cikmak icin: exit
echo ========================================
echo.

cmd /k
