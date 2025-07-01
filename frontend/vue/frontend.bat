@echo off
cd /d "%~dp0%"

REM Check if package.json exists
if exist package.json (
    echo 当前路径: %cd%
    echo Installing dependencies...
    call npm install

    if errorlevel 1 (
        echo Failed to install dependencies. Please check your network or Node.js environment.
        pause
        exit /b
    )

    echo Installing Vant UI...
    call npm install vant

    if errorlevel 1 (
        echo Failed to install Vant. Please try again later.
        pause
        exit /b
    )

    echo Installing Axios...
    call npm install axios

    if errorlevel 1 (
        echo Failed to install Axios. Please try again later.
        pause
        exit /b
    )

    echo Starting frontend service...
    call npm run dev -- --host
) else (
    echo Error: package.json not found in this directory!
)

pause