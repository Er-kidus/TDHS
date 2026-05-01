package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"pharmacy-backend/internal/models"
	"pharmacy-backend/internal/services"
	"pharmacy-backend/internal/database"
)

type EMRHandler struct {
	emrService    *services.EMRService
	prescriptionService *services.PrescriptionService
}

func NewEMRHandler(db *database.DB) *EMRHandler {
	return &EMRHandler{
		emrService:    services.NewEMRService("", ""), // Will be configured per EMR system
		prescriptionService: services.NewPrescriptionService(db),
	}
}

func (h *EMRHandler) SearchPatient(c *gin.Context) {
	identifier := c.Query("identifier")
	if identifier == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Identifier parameter is required"})
		return
	}

	// Get EMR system from context (would be set by middleware)
	emrSystem, exists := c.Get("emr_system")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EMR system not specified"})
		return
	}

	emrConfig, ok := emrSystem.(models.EMRSystem)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid EMR system configuration"})
		return
	}

	// Create EMR service with system-specific configuration
	emrService := services.NewEMRService(emrConfig.BaseURL, emrConfig.APIKey)

	patients, err := emrService.SearchPatient(identifier)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search patient: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"patients": patients})
}

func (h *EMRHandler) GetPatient(c *gin.Context) {
	patientID := c.Param("patient_id")
	if patientID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Patient ID is required"})
		return
	}

	// Get EMR system from context
	emrSystem, exists := c.Get("emr_system")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EMR system not specified"})
		return
	}

	emrConfig, ok := emrSystem.(models.EMRSystem)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid EMR system configuration"})
		return
	}

	// Create EMR service with system-specific configuration
	emrService := services.NewEMRService(emrConfig.BaseURL, emrConfig.APIKey)

	patient, err := emrService.GetPatient(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get patient: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, patient)
}

func (h *EMRHandler) GetMedicationRequests(c *gin.Context) {
	patientID := c.Param("patient_id")
	if patientID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Patient ID is required"})
		return
	}

	// Get EMR system from context
	emrSystem, exists := c.Get("emr_system")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EMR system not specified"})
		return
	}

	emrConfig, ok := emrSystem.(models.EMRSystem)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid EMR system configuration"})
		return
	}

	// Create EMR service with system-specific configuration
	emrService := services.NewEMRService(emrConfig.BaseURL, emrConfig.APIKey)

	requests, err := emrService.GetMedicationRequests(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get medication requests: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"medication_requests": requests})
}

func (h *EMRHandler) GetObservations(c *gin.Context) {
	patientID := c.Param("patient_id")
	if patientID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Patient ID is required"})
		return
	}

	// Get EMR system from context
	emrSystem, exists := c.Get("emr_system")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EMR system not specified"})
		return
	}

	emrConfig, ok := emrSystem.(models.EMRSystem)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid EMR system configuration"})
		return
	}

	// Create EMR service with system-specific configuration
	emrService := services.NewEMRService(emrConfig.BaseURL, emrConfig.APIKey)

	observations, err := emrService.GetObservations(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get observations: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"observations": observations})
}

func (h *EMRHandler) SyncPrescription(c *gin.Context) {
	prescriptionIDStr := c.Param("prescription_id")
	prescriptionID, err := uuid.Parse(prescriptionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid prescription ID"})
		return
	}

	// Get prescription from database
	prescription, err := h.prescriptionService.GetPrescription(prescriptionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	// Get prescription items
	items, err := h.prescriptionService.GetPrescriptionItems(prescriptionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get prescription items"})
		return
	}

	// Get EMR system from context
	emrSystem, exists := c.Get("emr_system")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EMR system not specified"})
		return
	}

	emrConfig, ok := emrSystem.(models.EMRSystem)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid EMR system configuration"})
		return
	}

	// Create EMR service with system-specific configuration
	emrService := services.NewEMRService(emrConfig.BaseURL, emrConfig.APIKey)

	// Sync prescription to EMR
	err = emrService.CreatePrescription(prescription, items)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync prescription: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prescription synced successfully"})
}

func (h *EMRHandler) UpdatePrescriptionStatus(c *gin.Context) {
	prescriptionIDStr := c.Param("prescription_id")
	prescriptionID, err := uuid.Parse(prescriptionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get prescription from database
	prescription, err := h.prescriptionService.GetPrescription(prescriptionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	// Get EMR system from context
	emrSystem, exists := c.Get("emr_system")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EMR system not specified"})
		return
	}

	emrConfig, ok := emrSystem.(models.EMRSystem)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid EMR system configuration"})
		return
	}

	// Create EMR service with system-specific configuration
	emrService := services.NewEMRService(emrConfig.BaseURL, emrConfig.APIKey)

	// Update status in EMR
	err = emrService.UpdatePrescriptionStatus(prescriptionIDStr, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update prescription status: " + err.Error()})
		return
	}

	// Also update status in local database
	prescription.Status = models.PrescriptionStatus(req.Status)
	err = h.prescriptionService.UpdatePrescription(prescriptionID, prescription)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update local prescription: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prescription status updated successfully"})
}

func (h *EMRHandler) TestConnection(c *gin.Context) {
	emrSystemIDStr := c.Param("emr_system_id")
	emrSystemID, err := uuid.Parse(emrSystemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid EMR system ID"})
		return
	}

	// Get EMR system from database
	db := database.NewDB()
	emrSystem, err := db.GetEMRSystem(emrSystemID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EMR system not found"})
		return
	}

	// Test connection
	emrService := services.NewEMRService(emrSystem.BaseURL, emrSystem.APIKey)
	err = emrService.TestConnection()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Connection test failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Connection successful"})
}

func (h *EMRHandler) GetIntegrationLogs(c *gin.Context) {
	emrSystemIDStr := c.Query("emr_system_id")
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")

	emrSystemID, err := uuid.Parse(emrSystemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid EMR system ID"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit parameter"})
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset parameter"})
		return
	}

	// Get logs from database
	db := database.NewDB()
	logs, err := db.GetEMRIntegrationLogs(emrSystemID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get integration logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"logs": logs})
}
