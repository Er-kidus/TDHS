package main

import (
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	// Create Gin router
	r := gin.Default()

	// Configure CORS
	r.Use(cors.Default())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Simple mock endpoints for demonstration
	r.GET("/api/v1/pharmacies", func(c *gin.Context) {
		// Mock pharmacy data
		pharmacies := []gin.H{
			{
				"id": "1",
				"name": "Central Pharmacy",
				"license_number": "PH-001",
				"address": "123 Main St, City, State",
				"phone": "555-0123",
				"email": "central@pharmacy.com",
				"is_active": true,
				"created_at": "2024-01-01T00:00:00Z",
			},
			{
				"id": "2", 
				"name": "East Side Pharmacy",
				"license_number": "PH-002",
				"address": "456 Oak Ave, City, State",
				"phone": "555-0456",
				"email": "east@pharmacy.com",
				"is_active": true,
				"created_at": "2024-01-02T00:00:00Z",
			},
		}
		c.JSON(http.StatusOK, gin.H{"pharmacies": pharmacies})
	})

	// Mock authentication endpoint
	r.POST("/api/v1/auth/login", func(c *gin.Context) {
		var login struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		
		if err := c.ShouldBindJSON(&login); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Simple mock authentication (accept any email/password)
		token := "mock-jwt-token-12345"
		user := gin.H{
			"id": "1",
			"email": login.Email,
			"first_name": "John",
			"last_name": "Doe",
			"role": "pharmacist",
			"pharmacy_id": "1",
		}

		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"user": user,
		})
	})

	// Mock registration endpoint
	r.POST("/api/v1/auth/register", func(c *gin.Context) {
		var register struct {
			Email     string `json:"email"`
			Password  string `json:"password"`
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
			Role      string `json:"role"`
		}
		
		if err := c.ShouldBindJSON(&register); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Mock user creation
		user := gin.H{
			"id": "2",
			"email": register.Email,
			"first_name": register.FirstName,
			"last_name": register.LastName,
			"role": register.Role,
			"pharmacy_id": "1",
		}

		token := "mock-jwt-token-67890"
		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"user": user,
		})
	})

	// Mock prescriptions endpoint
	r.GET("/api/v1/prescriptions", func(c *gin.Context) {
		prescriptions := []gin.H{
			{
				"id": "1",
				"prescription_number": "RX-001",
				"patient_id": "1",
				"doctor_id": "1",
				"pharmacy_id": "1",
				"date_prescribed": "2024-01-15T00:00:00Z",
				"status": "pending",
				"notes": "Take as needed",
				"created_at": "2024-01-15T00:00:00Z",
			},
		}
		c.JSON(http.StatusOK, gin.H{"prescriptions": prescriptions})
	})

	// Mock inventory endpoint
	r.GET("/api/v1/inventory", func(c *gin.Context) {
		inventory := []gin.H{
			{
				"id": "1",
				"pharmacy_id": "1",
				"medication_id": "1",
				"quantity_on_hand": 100,
				"reorder_level": 20,
				"unit_cost": 5.99,
				"selling_price": 9.99,
				"expiry_date": "2025-12-31",
				"batch_number": "BATCH-001",
				"supplier": "Medical Supply Co",
				"last_updated": "2024-01-15T00:00:00Z",
			},
		}
		c.JSON(http.StatusOK, gin.H{"inventory": inventory})
	})

	log.Println("Starting simple backend server on port 8080...")
	log.Fatal(r.Run(":8080"))
}
