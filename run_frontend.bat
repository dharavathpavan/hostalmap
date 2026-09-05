@echo off
TITLE Hostel Map - Frontend Web App Launcher
COLOR 0E
chcp 65001 >nul

echo ================================================================
echo           HOSTEL MAP - FRONTEND WEB ACCESS
echo ================================================================
echo.
echo Choose which section to open in your browser:
echo.
echo   [1] Discover Hostels Map       - http://localhost:3000/
echo   [2] Warden Management Portal    - http://localhost:3000/warden.html
echo   [3] Anonymous Student Reviews   - http://localhost:3000/review.html
echo   [4] QR Mess Feedback System     - http://localhost:3000/feedback.html
echo   [5] Super Admin Portal          - http://localhost:3000/admin.html
echo   [6] Open All Main Pages
echo.
set /p choice="Enter your choice (1-6) [Default: 1]: "

if "%choice%"=="" set choice=1

if "%choice%"=="1" (
    echo Opening Discover Hostels Map...
    start http://localhost:3000/
) else if "%choice%"=="2" (
    echo Opening Warden Portal...
    start http://localhost:3000/warden.html
) else if "%choice%"=="3" (
    echo Opening Student Review Page...
    start http://localhost:3000/review.html
) else if "%choice%"=="4" (
    echo Opening QR Feedback System...
    start http://localhost:3000/feedback.html
) else if "%choice%"=="5" (
    echo Opening Super Admin Portal...
    start http://localhost:3000/admin.html
) else if "%choice%"=="6" (
    echo Opening Discover Map and Warden Portal...
    start http://localhost:3000/
    timeout /t 1 /nobreak >nul
    start http://localhost:3000/warden.html
) else (
    echo Invalid selection, opening home page...
    start http://localhost:3000/
)

echo.
echo Note: If the page does not load, make sure the server is running by double-clicking "start_localhost.bat" or "run_server.bat".
echo.
timeout /t 3 /nobreak >nul
