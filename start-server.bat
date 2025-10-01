@echo off
title Vyoma VR Therapy Platform - Local Server
color 0A

echo =====================================
echo   VYOMA VR THERAPY PLATFORM
echo   Local Development Server
echo =====================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    echo.
    goto :trynode
) else (
    echo [OK] Python detected
    echo Starting Python HTTP server on port 8000...
    echo.
    echo Server will be available at:
    echo   http://localhost:8000
    echo   http://127.0.0.1:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo =====================================
    echo.
    python -m http.server 8000
    goto :end
)

:trynode
:: Check if Node.js is installed as alternative
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed either
    echo.
    echo Please install either:
    echo   - Python: https://www.python.org/
    echo   - Node.js: https://nodejs.org/
    echo.
    echo Or open index.html directly in your browser
    echo (some features may be limited without a server)
    echo.
    pause
    goto :end
) else (
    echo [OK] Node.js detected as alternative
    echo.
    
    :: Check if http-server is installed
    npx http-server --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Installing http-server...
        call npm install -g http-server
    )
    
    echo Starting Node.js HTTP server on port 8000...
    echo.
    echo Server will be available at:
    echo   http://localhost:8000
    echo   http://127.0.0.1:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo =====================================
    echo.
    npx http-server -p 8000 -c-1
)

:end
echo.
echo Server stopped.
pause