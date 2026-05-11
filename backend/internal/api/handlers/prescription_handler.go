package handlers

import (
	"net/http"

	"pharmacy-backend/internal/models"
	"pharmacy-backend/internal/services"
	"pharmacy-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PrescriptionHandler struct {
	prescriptionService *services.PrescriptionService
}

type CreatePrescriptionRequest struct {
	PatientID      string                   `json:"patient_id" binding:"required"`
	DoctorID       string                   `json:"doctor_id" binding:"required"`
	PharmacyID     string                   `json:"pharmacy_id" binding:"required"`
	DatePrescribed string                   `json:"date_prescribed" binding:"required"`
	Notes          *string                  `json:"notes"`
	Items          []CreatePrescriptionItem `json:"items" binding:"required,min=1"`
}

type CreatePrescriptionItem struct {
	MedicationID     string  `json:"medication_id" binding:"required"`
	Dosage           *string `json:"dosage"`
	Frequency        *string `json:"frequency"`
	Duration         *string `json:"duration"`
	Quantity         int     `json:"quantity" binding:"required,min=1"`
	Instructions     *string `json:"instructions"`
	RefillsRemaining int     `json:"refills_remaining"`
}

type UpdatePrescriptionRequest struct {
	PatientID      *string `json:"patient_id"`
	DoctorID       *string `json:"doctor_id"`
	PharmacyID     *string `json:"pharmacy_id"`
	DatePrescribed *string `json:"date_prescribed"`
	DateFilled     *string `json:"date_filled"`
	Status         *string `json:"status" binding:"omitempty,oneof=pending filled partially_filled cancelled expired"`
	Notes          *string `json:"notes"`
}

func NewPrescriptionHandler(prescriptionService *services.PrescriptionService) *PrescriptionHandler {
	return &PrescriptionHandler{prescriptionService: prescriptionService}
}

func (h *PrescriptionHandler) GetPrescriptions(c *gin.Context) {
	prescriptions, err := h.prescriptionService.GetPrescriptions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescriptions"})
		return
	}

	c.JSON(http.StatusOK, prescriptions)
}

func (h *PrescriptionHandler) GetPrescription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid prescription ID"})
		return
	}

	prescription, err := h.prescriptionService.GetPrescriptionByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	// Get prescription items
	items, err := h.prescriptionService.GetPrescriptionItems(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescription items"})
		return
	}

	response := gin.H{
		"prescription": prescription,
		"items":        items,
	}

	c.JSON(http.StatusOK, response)
}

func (h *PrescriptionHandler) CreatePrescription(c *gin.Context) {
	var req CreatePrescriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse UUIDs
	patientID, err := uuid.Parse(req.PatientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	doctorID, err := uuid.Parse(req.DoctorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
		return
	}

	pharmacyID, err := uuid.Parse(req.PharmacyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
		return
	}

	// Parse date
	datePrescribed, err := utils.ParseDate(req.DatePrescribed)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	prescription := &models.Prescription{
		PatientID:      patientID,
		DoctorID:       doctorID,
		PharmacyID:     pharmacyID,
		DatePrescribed: datePrescribed,
		Notes:          req.Notes,
	}

	if err := h.prescriptionService.CreatePrescription(prescription); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription"})
		return
	}

	// Add prescription items
	for _, itemReq := range req.Items {
		medicationID, err := uuid.Parse(itemReq.MedicationID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid medication ID"})
			return
		}

		item := &models.PrescriptionItem{
			PrescriptionID:   prescription.ID,
			MedicationID:     medicationID,
			Dosage:           itemReq.Dosage,
			Frequency:        itemReq.Frequency,
			Duration:         itemReq.Duration,
			Quantity:         itemReq.Quantity,
			Instructions:     itemReq.Instructions,
			RefillsRemaining: itemReq.RefillsRemaining,
		}

		if err := h.prescriptionService.AddPrescriptionItem(item); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add prescription item"})
			return
		}
	}

	c.JSON(http.StatusCreated, prescription)
}

func (h *PrescriptionHandler) UpdatePrescription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var req UpdatePrescriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get existing prescription
	prescription, err := h.prescriptionService.GetPrescriptionByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	// Update fields if provided
	if req.PatientID != nil {
		patientID, err := uuid.Parse(*req.PatientID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
			return
		}
		prescription.PatientID = patientID
	}
	if req.DoctorID != nil {
		doctorID, err := uuid.Parse(*req.DoctorID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
			return
		}
		prescription.DoctorID = doctorID
	}
	if req.PharmacyID != nil {
		pharmacyID, err := uuid.Parse(*req.PharmacyID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
			return
		}
		prescription.PharmacyID = pharmacyID
	}
	if req.DatePrescribed != nil {
		datePrescribed, err := utils.ParseDate(*req.DatePrescribed)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}
		prescription.DatePrescribed = datePrescribed
	}
	if req.DateFilled != nil {
		dateFilled, err := utils.ParseDate(*req.DateFilled)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}
		prescription.DateFilled = &dateFilled
	}
	if req.Status != nil {
		prescription.Status = models.PrescriptionStatus(*req.Status)
	}
	if req.Notes != nil {
		prescription.Notes = req.Notes
	}

	if err := h.prescriptionService.UpdatePrescription(prescription); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update prescription"})
		return
	}

	c.JSON(http.StatusOK, prescription)
}

func (h *PrescriptionHandler) DeletePrescription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid prescription ID"})
		return
	}

	if err := h.prescriptionService.DeletePrescription(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete prescription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prescription deleted successfully"})
}

func (h *PrescriptionHandler) FillPrescription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid prescription ID"})
		return
	}

	if err := h.prescriptionService.FillPrescription(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fill prescription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prescription filled successfully"})
}

func (h *PrescriptionHandler) GetPatientPrescriptions(c *gin.Context) {
	patientIDStr := c.Param("patientId")
	patientID, err := uuid.Parse(patientIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	prescriptions, err := h.prescriptionService.GetPatientPrescriptions(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patient prescriptions"})
		return
	}

	c.JSON(http.StatusOK, prescriptions)
}
