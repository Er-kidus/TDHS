package main

import (
	"log"
	"os"
	"pharmacy-system/internal/emr"
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

	// Initialize EMR service
	emrService := emr.NewService(db)

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

	// EMR routes
	emrGroup := r.Group("/api/v1/emr")
	{
		// Patient management
		emrGroup.GET("/patients", emrService.GetPatients)
		emrGroup.POST("/patients", emrService.CreatePatient)
		emrGroup.GET("/patients/:id", emrService.GetPatient)
		emrGroup.PUT("/patients/:id", emrService.UpdatePatient)
		emrGroup.GET("/patients/search", emrService.SearchPatients)
		emrGroup.GET("/patients/national-id/:nationalId", emrService.GetPatientByNationalID)
		// Medical records
		emrGroup.GET("/patients/:id/medical-history", emrService.GetMedicalHistory)
		emrGroup.POST("/patients/:id/medical-records", emrService.CreateMedicalRecord)
		emrGroup.GET("/medical-records/:id", emrService.GetMedicalRecord)
		// Allergies and conditions
		emrGroup.GET("/patients/:id/allergies", emrService.GetAllergies)
		emrGroup.POST("/patients/:id/allergies", emrService.AddAllergy)
		emrGroup.GET("/patients/:id/conditions", emrService.GetConditions)
		emrGroup.POST("/patients/:id/conditions", emrService.AddCondition)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "emr-service"})
	})

	port := os.Getenv("EMR_SERVICE_PORT")
	if port == "" {
		port = "8003"
	}
	
	log.Printf("EMR service starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
