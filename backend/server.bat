@echo off
cd /d "d:\Software_Engineering_5th_Year_Second_semester\Pharmacy\backend"
echo Installing dependencies...
npm install express cors
echo.
echo Starting server...
node simple-node-server.js
pause
