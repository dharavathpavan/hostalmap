@echo off
TITLE Hostel Map - Backend Server (Port 3000)
COLOR 0A
chcp 65001 >nul

echo ================================================================
echo           HOSTEL MAP - BACKEND SERVER LAUNCHER
echo ================================================================
echo.
echo Checking Node.js...
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

IF NOT EXIST "node_modules\" (
    echo Installing dependencies first...
    call npm install
)

echo Starting Express + Vite API Server on http://localhost:3000 ...
echo [Tip] To access the app, open http://localhost:3000 in your browser.
echo.
call npm run dev

pause
