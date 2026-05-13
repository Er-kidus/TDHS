package api

import (
	"pharmacy-backend/internal/api/handlers"
	"pharmacy-backend/internal/api/middleware"
	"pharmacy-backend/internal/database"
	"pharmacy-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, db *database.DB) {
	sqlDB := db.SQLDB()

	// Initialize services
	userService := services.NewUserService(sqlDB)
	pharmacyService := services.NewPharmacyService(sqlDB)
	medicationService := services.NewMedicationService(sqlDB)
	prescriptionService := services.NewPrescriptionService(sqlDB)
	inventoryService := services.NewInventoryService(sqlDB)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userService)
	userHandler := handlers.NewUserHandler(userService)
	pharmacyHandler := handlers.NewPharmacyHandler(pharmacyService)
	medicationHandler := handlers.NewMedicationHandler(medicationService)
	prescriptionHandler := handlers.NewPrescriptionHandler(prescriptionService)
	inventoryHandler := handlers.NewInventoryHandler(inventoryService)
	emrHandler := handlers.NewEMRHandler(db)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Protected routes (require authentication)
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("", userHandler.GetUsers)
				users.GET("/:id", userHandler.GetUser)
				users.PUT("/:id", userHandler.UpdateUser)
				users.DELETE("/:id", userHandler.DeleteUser)
				users.GET("/profile", userHandler.GetProfile)
				users.PUT("/profile", userHandler.UpdateProfile)
			}

			// Pharmacy routes
			pharmacies := protected.Group("/pharmacies")
			{
				pharmacies.GET("", pharmacyHandler.GetPharmacies)
				pharmacies.POST("", pharmacyHandler.CreatePharmacy)
				pharmacies.GET("/:id", pharmacyHandler.GetPharmacy)
				pharmacies.PUT("/:id", pharmacyHandler.UpdatePharmacy)
				pharmacies.DELETE("/:id", pharmacyHandler.DeletePharmacy)
			}

			// Medication routes
			medications := protected.Group("/medications")
			{
				medications.GET("", medicationHandler.GetMedications)
				medications.POST("", medicationHandler.CreateMedication)
				medications.GET("/:id", medicationHandler.GetMedication)
				medications.PUT("/:id", medicationHandler.UpdateMedication)
				medications.DELETE("/:id", medicationHandler.DeleteMedication)
			}

			// Prescription routes
			prescriptions := protected.Group("/prescriptions")
			{
				prescriptions.GET("", prescriptionHandler.GetPrescriptions)
				prescriptions.POST("", prescriptionHandler.CreatePrescription)
				prescriptions.GET("/:id", prescriptionHandler.GetPrescription)
				prescriptions.PUT("/:id", prescriptionHandler.UpdatePrescription)
				prescriptions.DELETE("/:id", prescriptionHandler.DeletePrescription)
				prescriptions.POST("/:id/fill", prescriptionHandler.FillPrescription)
				prescriptions.GET("/patient/:patient_id", prescriptionHandler.GetPatientPrescriptions)
			}

			// Inventory routes
			inventory := protected.Group("/inventory")
			{
				inventory.GET("", inventoryHandler.GetInventory)
				inventory.POST("", inventoryHandler.CreateInventoryItem)
				inventory.GET("/:id", inventoryHandler.GetInventoryItem)
				inventory.PUT("/:id", inventoryHandler.UpdateInventoryItem)
				inventory.DELETE("/:id", inventoryHandler.DeleteInventoryItem)
				inventory.GET("/low-stock", inventoryHandler.GetLowStockItems)
				inventory.POST("/restock", inventoryHandler.RestockItem)
			}

			// EMR Integration routes
			emr := protected.Group("/emr")
			{
				emr.GET("/patients/search", emrHandler.SearchPatient)
				emr.GET("/patients/:patient_id", emrHandler.GetPatient)
				emr.GET("/patients/:patient_id/medications", emrHandler.GetMedicationRequests)
				emr.GET("/patients/:patient_id/observations", emrHandler.GetObservations)
				emr.POST("/prescriptions/:prescription_id/sync", emrHandler.SyncPrescription)
				emr.PUT("/prescriptions/:prescription_id/status", emrHandler.UpdatePrescriptionStatus)
				emr.GET("/systems/:emr_system_id/test", emrHandler.TestConnection)
				emr.GET("/logs", emrHandler.GetIntegrationLogs)
			}
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
