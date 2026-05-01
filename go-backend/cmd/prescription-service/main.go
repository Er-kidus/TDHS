package main

import (
	"log"
	"os"
	"pharmacy-system/internal/prescription"
	"pharmacy-system/internal/database"
	"pharmacy-system/pkg/config"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()
	
	// Initialize database
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize prescription service
	prescriptionService := prescription.NewService(db)

	// Setup Gin router
	r := gin.Default()
	
	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		
		c.Next()
	})

	// Prescription routes
	prescriptionGroup := r.Group("/api/v1/prescriptions")
	{
		prescriptionGroup.GET("/", prescriptionService.GetPrescriptions)
		prescriptionGroup.GET("/:id", prescriptionService.GetPrescription)
		prescriptionGroup.POST("/", prescriptionService.CreatePrescription)
		prescriptionGroup.PUT("/:id", prescriptionService.UpdatePrescription)
		prescriptionGroup.DELETE("/:id", prescriptionService.DeletePrescription)
		
		// QR code generation
		prescriptionGroup.GET("/:id/qr", prescriptionService.GenerateQRCode)
		prescriptionGroup.POST("/:id/validate", prescriptionService.ValidatePrescription)
		
		// Fill prescription
		prescriptionGroup.POST("/:id/fill", prescriptionService.FillPrescription)
		
		// Patient prescriptions
		prescriptionGroup.GET("/patient/:patientId", prescriptionService.GetPatientPrescriptions)
		prescriptionGroup.GET("/doctor/:doctorId", prescriptionService.GetDoctorPrescriptions)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "prescription-service"})
	})

	port := os.Getenv("PRESCRIPTION_SERVICE_PORT")
	if port == "" {
		port = "8004"
	}
	
	log.Printf("Prescription service starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
