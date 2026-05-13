@echo off
echo Starting Simple Pharmacy Backend Server...
echo.
echo This is a minimal server with no dependencies required
echo.
echo Server will run on: http://localhost:8080
echo Health check: http://localhost:8080/health
echo.
echo LOGIN CREDENTIALS:
echo   Admin: admin@test.com / admin123
echo   Pharmacist: pharmacist@test.com / pharm123
echo   Technician: tech@test.com / tech123
echo.
echo Press Ctrl+C to stop the server
echo.

node simple-working-server.js
