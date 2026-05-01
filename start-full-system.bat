@echo off
echo Starting Pharmacy Management System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d d:\Software_Engineering_5th_Year_Second_semester\Pharmacy\backend && npm start"

echo.
echo Starting Frontend Server...
timeout /t 3 >nul
start "Frontend Server" cmd /k "cd /d d:\Software_Engineering_5th_Year_Second_semester\Pharmacy\frontend && npm run dev"

echo.
echo System is starting up...
echo Frontend will be available at: http://localhost:3001
echo Backend API will be available at: http://localhost:8081
echo.
echo Press any key to exit...
pause > nul
