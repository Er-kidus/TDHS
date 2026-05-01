package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"pharmacy-backend/internal/models"
	"pharmacy-backend/internal/services"
)

type MedicationHandler struct {
	medicationService *services.MedicationService
}

type CreateMedicationRequest struct {
	NDCCode              string  `json:"ndc_code" binding:"required"`
	BrandName            string  `json:"brand_name" binding:"required"`
	GenericName          string  `json:"generic_name" binding:"required"`
	DosageForm           *string `json:"dosage_form"`
	Strength             *string `json:"strength"`
	Manufacturer         *string `json:"manufacturer"`
	Description          *string `json:"description"`
	IsControlledSubstance bool    `json:"is_controlled_substance"`
	ScheduleLevel        *int    `json:"schedule_level"`
}

type UpdateMedicationRequest struct {
	NDCCode              *string `json:"ndc_code"`
	BrandName            *string `json:"brand_name"`
	GenericName          *string `json:"generic_name"`
	DosageForm           *string `json:"dosage_form"`
	Strength             *string `json:"strength"`
	Manufacturer         *string `json:"manufacturer"`
	Description          *string `json:"description"`
	IsControlledSubstance *bool   `json:"is_controlled_substance"`
	ScheduleLevel        *int    `json:"schedule_level"`
}

func NewMedicationHandler(medicationService *services.MedicationService) *MedicationHandler {
	return &MedicationHandler{medicationService: medicationService}
}

func (h *MedicationHandler) GetMedications(c *gin.Context) {
	searchTerm := c.Query("search")
	
	var medications []*models.Medication
	var err error
	
	if searchTerm != "" {
		medications, err = h.medicationService.SearchMedications(searchTerm)
	} else {
		medications, err = h.medicationService.GetMedications()
	}
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch medications"})
		return
	}

	c.JSON(http.StatusOK, medications)
}

func (h *MedicationHandler) GetMedication(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid medication ID"})
		return
	}

	medication, err := h.medicationService.GetMedicationByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Medication not found"})
		return
	}

	c.JSON(http.StatusOK, medication)
}

func (h *MedicationHandler) CreateMedication(c *gin.Context) {
	var req CreateMedicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	medication := &models.Medication{
		NDCCode:              req.NDCCode,
		BrandName:            req.BrandName,
		GenericName:          req.GenericName,
		DosageForm:           req.DosageForm,
		Strength:             req.Strength,
		Manufacturer:         req.Manufacturer,
		Description:          req.Description,
		IsControlledSubstance: req.IsControlledSubstance,
		ScheduleLevel:        req.ScheduleLevel,
	}

	if err := h.medicationService.CreateMedication(medication); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create medication"})
		return
	}

	c.JSON(http.StatusCreated, medication)
}

func (h *MedicationHandler) UpdateMedication(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid medication ID"})
		return
	}

	var req UpdateMedicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get existing medication
	medication, err := h.medicationService.GetMedicationByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Medication not found"})
		return
	}

	// Update fields if provided
	if req.NDCCode != nil {
		medication.NDCCode = *req.NDCCode
	}
	if req.BrandName != nil {
		medication.BrandName = *req.BrandName
	}
	if req.GenericName != nil {
		medication.GenericName = *req.GenericName
	}
	if req.DosageForm != nil {
		medication.DosageForm = req.DosageForm
	}
	if req.Strength != nil {
		medication.Strength = req.Strength
	}
	if req.Manufacturer != nil {
		medication.Manufacturer = req.Manufacturer
	}
	if req.Description != nil {
		medication.Description = req.Description
	}
	if req.IsControlledSubstance != nil {
		medication.IsControlledSubstance = *req.IsControlledSubstance
	}
	if req.ScheduleLevel != nil {
		medication.ScheduleLevel = req.ScheduleLevel
	}

	if err := h.medicationService.UpdateMedication(medication); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update medication"})
		return
	}

	c.JSON(http.StatusOK, medication)
}

func (h *MedicationHandler) DeleteMedication(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid medication ID"})
		return
	}

	if err := h.medicationService.DeleteMedication(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete medication"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Medication deleted successfully"})
}
