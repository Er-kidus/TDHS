@echo off
echo Starting Enhanced Pharmacy Management System Backend...
echo.

echo Installing dependencies...
call npm install --production

echo.
echo Starting production server with PostgreSQL integration...
echo.
echo Server will be available at: http://localhost:8080
echo Health check: http://localhost:8080/health
echo System status: http://localhost:8080/api/v1/system/status
echo.
echo Features enabled:
echo - PostgreSQL database with real persistence
echo - JWT authentication with proper validation
echo - Real-time WebSocket notifications
echo - Rate limiting and security headers
echo - Comprehensive audit logging
echo - Input validation and error handling
echo.

node enhanced-server.js

pause
