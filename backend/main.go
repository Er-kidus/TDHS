package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"pharmacy-backend/internal/api"
	"pharmacy-backend/internal/config"
	"pharmacy-backend/internal/database"
)

func main() {
	log.Println("Starting Pharmacy Backend...")
	
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	// Initialize configuration
	cfg := config.Load()
	log.Printf("Database URL: %s", cfg.DatabaseURL)

	// Initialize database
	log.Println("Initializing database...")
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	log.Println("Database initialized successfully")

	// Initialize Gin router
	log.Println("Setting up router...")
	router := gin.Default()

	// Setup CORS
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Setup API routes
	log.Println("Setting up API routes...")
	api.SetupRoutes(router, db)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("Health check available at: http://localhost:%s/health", port)
	log.Printf("API available at: http://localhost:%s/api/v1", port)
	
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
