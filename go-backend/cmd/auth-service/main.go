package main

import (
	"log"
	"os"
	"pharmacy-system/internal/auth"
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

	// Initialize auth service
	authService := auth.NewService(db)

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

	// Auth routes
	authGroup := r.Group("/api/v1/auth")
	{
		authGroup.POST("/register", authService.Register)
		authGroup.POST("/login", authService.Login)
		authGroup.POST("/refresh", authService.RefreshToken)
		authGroup.POST("/logout", authService.Logout)
		authGroup.GET("/profile", authService.GetProfile)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "auth-service"})
	})

	port := os.Getenv("AUTH_SERVICE_PORT")
	if port == "" {
		port = "8001"
	}
	
	log.Printf("Auth service starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
