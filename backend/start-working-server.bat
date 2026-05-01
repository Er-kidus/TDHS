@echo off
echo Starting Working Pharmacy Management System Backend...
echo.
echo This server uses in-memory data simulation (no PostgreSQL required)
echo.
echo Server will be available at: http://localhost:8080
echo Health check: http://localhost:8080/health
echo.
echo Features enabled:
echo - In-memory database with sample data
echo - JWT authentication simulation
echo - All API endpoints implemented
echo - Real prescription, inventory, and patient data
echo - No external dependencies required
echo.
echo Test Credentials:
echo - Admin: admin@pharmacy.test / admin123
echo - Pharmacist: pharmacist@pharmacy.test / pharm123
echo - Technician: tech@pharmacy.test / tech123
echo.

node working-server.js

pause
