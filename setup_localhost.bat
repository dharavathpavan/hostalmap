@echo off
TITLE Hostel Map - One-Time Localhost Setup
COLOR 0D
chcp 65001 >nul

echo ================================================================
echo           HOSTEL MAP - ONE-TIME LOCALHOST SETUP
echo ================================================================
echo.
echo [Step 1] Checking Node.js and NPM...
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is NOT installed!
    echo Please install Node.js (18+) from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] NPM was not found in PATH.
    pause
    exit /b 1
)

echo [Step 2] Installing Node Dependencies...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install encountered an error.
    pause
    exit /b 1
)

echo.
echo [Step 3] Creating .env file if missing...
IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        copy .env.example .env >nul
        echo Created .env file.
    )
)

echo.
echo [Step 4] Validating TypeScript & Codebase...
call npm run lint
IF %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Lint reported warnings, but you can still run the app.
)

echo.
echo ================================================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo ================================================================
echo.
echo To start the application, double-click:
echo   - "start_localhost.bat" (Runs both server and opens browser)
echo.
pause
