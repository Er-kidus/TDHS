package main

import (
	"log"
	"os"
	"pharmacy-system/internal/pharmacy"
	"pharmacy-system/internal/reports"
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

	// Initialize pharmacy service
	pharmacyService := pharmacy.NewService(db)
	
	// Initialize reports service
	reportsService := reports.NewService(db)

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

	// Pharmacy routes
	pharmacyGroup := r.Group("/api/v1/pharmacy")
	{
		// Medicine management
		pharmacyGroup.GET("/medicines", pharmacyService.GetMedicines)
		pharmacyGroup.POST("/medicines", pharmacyService.AddMedicine)
		pharmacyGroup.PUT("/medicines/:id", pharmacyService.UpdateMedicine)
		pharmacyGroup.DELETE("/medicines/:id", pharmacyService.DeleteMedicine)
		
		// Inventory management
		pharmacyGroup.GET("/inventory", pharmacyService.GetInventory)
		pharmacyGroup.GET("/inventory/low-stock", pharmacyService.GetLowStockItems)
		pharmacyGroup.POST("/inventory/adjust", pharmacyService.AdjustInventory)
		
		// Sales management
		pharmacyGroup.POST("/sales", pharmacyService.CreateSale)
		pharmacyGroup.GET("/sales", pharmacyService.GetSales)
		pharmacyGroup.GET("/sales/:id", pharmacyService.GetSale)
		
		// Supplier management
		pharmacyGroup.GET("/suppliers", pharmacyService.GetSuppliers)
		pharmacyGroup.POST("/suppliers", pharmacyService.AddSupplier)
		pharmacyGroup.PUT("/suppliers/:id", pharmacyService.UpdateSupplier)
		
		// Purchase orders
		pharmacyGroup.GET("/purchase-orders", pharmacyService.GetPurchaseOrders)
		pharmacyGroup.POST("/purchase-orders", pharmacyService.CreatePurchaseOrder)
		pharmacyGroup.PUT("/purchase-orders/:id", pharmacyService.UpdatePurchaseOrder)
	
		// Reports endpoints
		pharmacyGroup.GET("/reports/sales", reportsService.GetSalesReport)
		pharmacyGroup.GET("/reports/inventory", reportsService.GetInventoryReport)
		pharmacyGroup.GET("/reports/prescriptions", reportsService.GetPrescriptionReport)
		pharmacyGroup.GET("/reports/analytics", reportsService.GetAnalytics)
		pharmacyGroup.GET("/reports/most-sold", reportsService.GetMostSoldMedicines)
		pharmacyGroup.GET("/reports/patient-demographics", reportsService.GetPatientDemographics)
		pharmacyGroup.GET("/reports/export", reportsService.ExportReport)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "pharmacy-service"})
	})

	port := os.Getenv("PHARMACY_SERVICE_PORT")
	if port == "" {
		port = "8002"
	}
	
	log.Printf("Pharmacy service starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
