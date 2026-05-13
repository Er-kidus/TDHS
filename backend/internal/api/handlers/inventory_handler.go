package handlers

import (
	"net/http"
	"time"

	"pharmacy-backend/internal/models"
	"pharmacy-backend/internal/services"
	"pharmacy-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type InventoryHandler struct {
	inventoryService *services.InventoryService
}

type CreateInventoryRequest struct {
	PharmacyID     string   `json:"pharmacy_id" binding:"required"`
	MedicationID   string   `json:"medication_id" binding:"required"`
	QuantityOnHand int      `json:"quantity_on_hand" binding:"required,min=0"`
	ReorderLevel   int      `json:"reorder_level"`
	UnitCost       *float64 `json:"unit_cost"`
	SellingPrice   *float64 `json:"selling_price"`
	ExpiryDate     *string  `json:"expiry_date"`
	BatchNumber    *string  `json:"batch_number"`
	Supplier       *string  `json:"supplier"`
}

type UpdateInventoryRequest struct {
	QuantityOnHand *int     `json:"quantity_on_hand"`
	ReorderLevel   *int     `json:"reorder_level"`
	UnitCost       *float64 `json:"unit_cost"`
	SellingPrice   *float64 `json:"selling_price"`
	ExpiryDate     *string  `json:"expiry_date"`
	BatchNumber    *string  `json:"batch_number"`
	Supplier       *string  `json:"supplier"`
}

type RestockRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

func NewInventoryHandler(inventoryService *services.InventoryService) *InventoryHandler {
	return &InventoryHandler{inventoryService: inventoryService}
}

func (h *InventoryHandler) GetInventory(c *gin.Context) {
	pharmacyIDStr := c.Query("pharmacy_id")

	if pharmacyIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pharmacy_id query parameter is required"})
		return
	}

	pharmacyID, err := uuid.Parse(pharmacyIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
		return
	}

	inventory, err := h.inventoryService.GetInventory(pharmacyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	c.JSON(http.StatusOK, inventory)
}

func (h *InventoryHandler) GetInventoryItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inventory ID"})
		return
	}

	item, err := h.inventoryService.GetInventoryItem(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}

	c.JSON(http.StatusOK, item)
}

func (h *InventoryHandler) CreateInventoryItem(c *gin.Context) {
	var req CreateInventoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse UUIDs
	pharmacyID, err := uuid.Parse(req.PharmacyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
		return
	}

	medicationID, err := uuid.Parse(req.MedicationID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid medication ID"})
		return
	}

	// Parse expiry date if provided
	var expiryDate *time.Time
	if req.ExpiryDate != nil {
		ed, err := utils.ParseDate(*req.ExpiryDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expiry date format. Use YYYY-MM-DD"})
			return
		}
		expiryDate = &ed
	}

	inventory := &models.Inventory{
		PharmacyID:     pharmacyID,
		MedicationID:   medicationID,
		QuantityOnHand: req.QuantityOnHand,
		ReorderLevel:   req.ReorderLevel,
		UnitCost:       req.UnitCost,
		SellingPrice:   req.SellingPrice,
		ExpiryDate:     expiryDate,
		BatchNumber:    req.BatchNumber,
		Supplier:       req.Supplier,
	}

	if err := h.inventoryService.CreateInventoryItem(inventory); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create inventory item"})
		return
	}

	c.JSON(http.StatusCreated, inventory)
}

func (h *InventoryHandler) UpdateInventoryItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inventory ID"})
		return
	}

	var req UpdateInventoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get existing inventory item
	inventory, err := h.inventoryService.GetInventoryItem(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}

	// Update fields if provided
	if req.QuantityOnHand != nil {
		inventory.QuantityOnHand = *req.QuantityOnHand
	}
	if req.ReorderLevel != nil {
		inventory.ReorderLevel = *req.ReorderLevel
	}
	if req.UnitCost != nil {
		inventory.UnitCost = req.UnitCost
	}
	if req.SellingPrice != nil {
		inventory.SellingPrice = req.SellingPrice
	}
	if req.ExpiryDate != nil {
		expiryDate, err := utils.ParseDate(*req.ExpiryDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expiry date format. Use YYYY-MM-DD"})
			return
		}
		inventory.ExpiryDate = &expiryDate
	}
	if req.BatchNumber != nil {
		inventory.BatchNumber = req.BatchNumber
	}
	if req.Supplier != nil {
		inventory.Supplier = req.Supplier
	}

	if err := h.inventoryService.UpdateInventoryItem(inventory); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update inventory item"})
		return
	}

	c.JSON(http.StatusOK, inventory)
}

func (h *InventoryHandler) DeleteInventoryItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inventory ID"})
		return
	}

	if err := h.inventoryService.DeleteInventoryItem(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete inventory item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Inventory item deleted successfully"})
}

func (h *InventoryHandler) GetLowStockItems(c *gin.Context) {
	pharmacyIDStr := c.Query("pharmacy_id")

	if pharmacyIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pharmacy_id query parameter is required"})
		return
	}

	pharmacyID, err := uuid.Parse(pharmacyIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
		return
	}

	items, err := h.inventoryService.GetLowStockItems(pharmacyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch low stock items"})
		return
	}

	c.JSON(http.StatusOK, items)
}

func (h *InventoryHandler) RestockItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inventory ID"})
		return
	}

	var req RestockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.inventoryService.RestockItem(id, req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restock item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item restocked successfully"})
}
