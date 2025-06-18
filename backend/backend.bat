@echo off
cd /d "%~dp0%"

REM Check if package.json exists
if exist package.json (
    echo Installing dependencies...
    call npm install

    if errorlevel 1 (
        echo Failed to install dependencies. Please check your network or Node.js environment.
        pause
        exit /b
    )

    echo Starting backend service...
    call npm run start
) else (
    echo Error: package.json not found in this directory!
)

pause