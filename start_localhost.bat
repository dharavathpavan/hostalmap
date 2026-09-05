@echo off
TITLE Hostel Map - Localhost Full-Stack Launcher
COLOR 0B
chcp 65001 >nul

echo ================================================================
echo           HOSTEL MAP - LOCALHOST RUNNER & SERVER
echo ================================================================
echo.
echo [1/4] Checking Node.js installation...
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is NOT installed or not in your system PATH!
    echo Please download and install Node.js (version 18 or higher) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   -- Found Node.js %NODE_VERSION%

echo.
echo [2/4] Verifying project dependencies...
IF NOT EXIST "node_modules\" (
    echo   -- node_modules folder not found. Running "npm install"...
    call npm install
    IF %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install npm packages.
        pause
        exit /b 1
    )
) ELSE (
    echo   -- Dependencies already installed.
)

echo.
echo [3/4] Preparing environment...
IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        copy .env.example .env >nul
        echo   -- Created default .env file from .env.example
    )
)

echo.
echo [4/4] Starting Hostel Map Server on http://localhost:3000 ...
echo   -- Press Ctrl+C in this terminal window to stop the server at any time.
echo.

:: Launch browser in background after 3 seconds
start /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Start the unified full-stack server (serves Express API + Frontend static files)
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server stopped with an error code.
    pause
)
