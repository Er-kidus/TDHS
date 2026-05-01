@echo off
echo Starting Fixed Pharmacy Backend Server...
echo.
echo This server fixes registration issues with better error handling
echo.
echo Server will run on: http://localhost:8080
echo Health check: http://localhost:8080/health
echo.
echo LOGIN CREDENTIALS:
echo   Admin: admin@test.com / admin123
echo   Pharmacist: pharmacist@test.com / pharm123
echo   Technician: tech@test.com / tech123
echo.
echo ✅ Registration now working with proper validation!
echo Press Ctrl+C to stop the server
echo.

node fixed-simple-server.js
