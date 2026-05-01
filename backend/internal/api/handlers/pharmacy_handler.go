package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"pharmacy-backend/internal/models"
	"pharmacy-backend/internal/services"
)

type PharmacyHandler struct {
	pharmacyService *services.PharmacyService
}

type CreatePharmacyRequest struct {
	Name          string `json:"name" binding:"required"`
	LicenseNumber string `json:"license_number" binding:"required"`
	Address       string `json:"address" binding:"required"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
}

type UpdatePharmacyRequest struct {
	Name          *string `json:"name"`
	LicenseNumber *string `json:"license_number"`
	Address       *string `json:"address"`
	Phone         *string `json:"phone"`
	Email         *string `json:"email"`
}

func NewPharmacyHandler(pharmacyService *services.PharmacyService) *PharmacyHandler {
	return &PharmacyHandler{pharmacyService: pharmacyService}
}

func (h *PharmacyHandler) GetPharmacies(c *gin.Context) {
	pharmacies, err := h.pharmacyService.GetPharmacies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pharmacies"})
		return
	}

	c.JSON(http.StatusOK, pharmacies)
}

func (h *PharmacyHandler) GetPharmacy(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
		return
	}

	pharmacy, err := h.pharmacyService.GetPharmacyByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pharmacy not found"})
		return
	}

	c.JSON(http.StatusOK, pharmacy)
}

func (h *PharmacyHandler) CreatePharmacy(c *gin.Context) {
	var req CreatePharmacyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pharmacy := &models.Pharmacy{
		Name:          req.Name,
		LicenseNumber: req.LicenseNumber,
		Address:       req.Address,
		Phone:         &req.Phone,
		Email:         &req.Email,
	}

	if err := h.pharmacyService.CreatePharmacy(pharmacy); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pharmacy"})
		return
	}

	c.JSON(http.StatusCreated, pharmacy)
}

func (h *PharmacyHandler) UpdatePharmacy(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
		return
	}

	var req UpdatePharmacyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get existing pharmacy
	pharmacy, err := h.pharmacyService.GetPharmacyByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pharmacy not found"})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		pharmacy.Name = *req.Name
	}
	if req.LicenseNumber != nil {
		pharmacy.LicenseNumber = *req.LicenseNumber
	}
	if req.Address != nil {
		pharmacy.Address = *req.Address
	}
	if req.Phone != nil {
		pharmacy.Phone = req.Phone
	}
	if req.Email != nil {
		pharmacy.Email = req.Email
	}

	if err := h.pharmacyService.UpdatePharmacy(pharmacy); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pharmacy"})
		return
	}

	c.JSON(http.StatusOK, pharmacy)
}

func (h *PharmacyHandler) DeletePharmacy(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
		return
	}

	if err := h.pharmacyService.DeletePharmacy(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pharmacy"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pharmacy deleted successfully"})
}
