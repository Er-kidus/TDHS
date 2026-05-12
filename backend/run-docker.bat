@echo off
echo Building and starting Go Pharmacy Backend with Docker...
echo.
docker-compose down
docker-compose up --build
