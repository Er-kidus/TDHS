@echo off
echo Starting Go Microservices Backend...
echo.

echo Checking Go installation...
go version

echo.
echo Building Go service...
cd go-service
go mod tidy
go build -o pharmacy-service main.go

echo.
echo Starting Go microservice on port 8081...
echo Service will be available at: http://localhost:8081
echo Health check: http://localhost:8081/health
echo.

pharmacy-service.exe

pause
