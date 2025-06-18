@echo off

REM 启动 backend 服务
echo Starting backend...
cd /d "%~dp0%backend"
start "" "backend.bat"

REM 启动 frontend 服务
echo Starting frontend...
cd /d "%~dp0%frontend/vue"
start "" "frontend.bat"