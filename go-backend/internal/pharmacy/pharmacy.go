package pharmacy

import (
	"fmt"
	"pharmacy-system/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

type AddMedicineRequest struct {
	Name         string  `json:"name" binding:"required"`
	GenericName  string  `json:"generic_name"`
	Category     string  `json:"category"`
	Manufacturer string  `json:"manufacturer"`
	NDCNumber    string  `json:"ndc_number"`
	Description  string  `json:"description"`
	Strength     string  `json:"strength"`
	Form         string  `json:"form"`
	IsControlled bool    `json:"is_controlled"`
}

type InventoryAdjustRequest struct {
	MedicineID uuid.UUID `json:"medicine_id" binding:"required"`
	Quantity   int       `json:"quantity" binding:"required"`
	Type       string    `json:"type" binding:"required,oneof=in out adjustment"`
	Notes      string    `json:"notes"`
}

type CreateSaleRequest struct {
	PrescriptionID *uuid.UUID `json:"prescription_id"`
	PatientID      uuid.UUID  `json:"patient_id" binding:"required"`
	Items          []SaleItem  `json:"items" binding:"required"`
	PaymentMethod   string      `json:"payment_method" binding:"required"`
}

type SaleItem struct {
	MedicineID uuid.UUID `json:"medicine_id" binding:"required"`
	Quantity   int       `json:"quantity" binding:"required"`
	UnitPrice  float64   `json:"unit_price" binding:"required"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetMedicines(c *gin.Context) {
	var medicines []models.Medicine
	if err := s.db.Find(&medicines).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch medicines"})
		return
	}
	c.JSON(200, gin.H{"medicines": medicines})
}

func (s *Service) AddMedicine(c *gin.Context) {
	var req AddMedicineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	medicine := models.Medicine{
		Name:         req.Name,
		GenericName:  req.GenericName,
		Category:     req.Category,
		Manufacturer: req.Manufacturer,
		NDCNumber:    req.NDCNumber,
		Description:  req.Description,
		Strength:     req.Strength,
		Form:         req.Form,
		IsControlled: req.IsControlled,
	}

	if err := s.db.Create(&medicine).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create medicine"})
		return
	}

	c.JSON(201, gin.H{"medicine": medicine})
}

func (s *Service) UpdateMedicine(c *gin.Context) {
	id := c.Param("id")
	medicineID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid medicine ID"})
		return
	}

	var medicine models.Medicine
	if err := s.db.Where("id = ?", medicineID).First(&medicine).Error; err != nil {
		c.JSON(404, gin.H{"error": "Medicine not found"})
		return
	}

	if err := c.ShouldBindJSON(&medicine); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if err := s.db.Save(&medicine).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update medicine"})
		return
	}

	c.JSON(200, gin.H{"medicine": medicine})
}

func (s *Service) DeleteMedicine(c *gin.Context) {
	id := c.Param("id")
	medicineID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid medicine ID"})
		return
	}

	if err := s.db.Delete(&models.Medicine{}, medicineID).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete medicine"})
		return
	}

	c.JSON(200, gin.H{"message": "Medicine deleted successfully"})
}

func (s *Service) GetInventory(c *gin.Context) {
	pharmacyID := c.Query("pharmacy_id")
	if pharmacyID == "" {
		c.JSON(400, gin.H{"error": "pharmacy_id is required"})
		return
	}

	var inventory []models.PharmacyInventory
	if err := s.db.Where("pharmacy_id = ?", pharmacyID).Find(&inventory).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	c.JSON(200, gin.H{"inventory": inventory})
}

func (s *Service) GetLowStockItems(c *gin.Context) {
	pharmacyID := c.Query("pharmacy_id")
	if pharmacyID == "" {
		c.JSON(400, gin.H{"error": "pharmacy_id is required"})
		return
	}

	var lowStockItems []models.PharmacyInventory
	if err := s.db.Where("pharmacy_id = ? AND quantity_on_hand <= reorder_level", pharmacyID).Find(&lowStockItems).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch low stock items"})
		return
	}

	c.JSON(200, gin.H{"low_stock_items": lowStockItems})
}

func (s *Service) AdjustInventory(c *gin.Context) {
	var req InventoryAdjustRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Create inventory transaction
	transaction := models.InventoryTransaction{
		MedicineID:     req.MedicineID,
		TransactionType: req.Type,
		Quantity:       req.Quantity,
		Notes:          req.Notes,
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create inventory transaction"})
		return
	}

	// Update inventory quantity
	var inventory models.PharmacyInventory
	if err := s.db.Where("medicine_id = ?", req.MedicineID).First(&inventory).Error; err != nil {
		c.JSON(404, gin.H{"error": "Inventory item not found"})
		return
	}

	switch req.Type {
	case "in":
		inventory.QuantityOnHand += req.Quantity
	case "out", "adjustment":
		inventory.QuantityOnHand -= req.Quantity
	}

	if err := s.db.Save(&inventory).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update inventory"})
		return
	}

	c.JSON(200, gin.H{"message": "Inventory adjusted successfully"})
}

func (s *Service) CreateSale(c *gin.Context) {
	var req CreateSaleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.UnitPrice * float64(item.Quantity)
	}

	// Create sales transaction
	sale := models.SalesTransaction{
		PrescriptionID: req.PrescriptionID,
		PatientID:      req.PatientID,
		TotalAmount:    totalAmount,
		PaymentMethod:   req.PaymentMethod,
		Status:         "completed",
	}

	if err := s.db.Create(&sale).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create sale"})
		return
	}

	// Update inventory for each item
	for _, item := range req.Items {
		var inventory models.PharmacyInventory
		if err := s.db.Where("medicine_id = ?", item.MedicineID).First(&inventory).Error; err != nil {
			continue
		}

		// Create inventory transaction
		transaction := models.InventoryTransaction{
			MedicineID:     item.MedicineID,
			TransactionType: "out",
			Quantity:       item.Quantity,
			ReferenceID:    &sale.ID,
			Notes:          fmt.Sprintf("Sale transaction %s", sale.ID.String()),
		}
		s.db.Create(&transaction)

		// Update stock
		inventory.QuantityOnHand -= item.Quantity
		s.db.Save(&inventory)
	}

	c.JSON(201, gin.H{"sale": sale})
}

func (s *Service) GetSales(c *gin.Context) {
	var sales []models.SalesTransaction
	if err := s.db.Find(&sales).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch sales"})
		return
	}
	c.JSON(200, gin.H{"sales": sales})
}

func (s *Service) GetSale(c *gin.Context) {
	id := c.Param("id")
	saleID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid sale ID"})
		return
	}

	var sale models.SalesTransaction
	if err := s.db.Where("id = ?", saleID).First(&sale).Error; err != nil {
		c.JSON(404, gin.H{"error": "Sale not found"})
		return
	}

	c.JSON(200, gin.H{"sale": sale})
}

func (s *Service) GetSuppliers(c *gin.Context) {
	var suppliers []models.Supplier
	if err := s.db.Find(&suppliers).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch suppliers"})
		return
	}
	c.JSON(200, gin.H{"suppliers": suppliers})
}

func (s *Service) AddSupplier(c *gin.Context) {
	var supplier models.Supplier
	if err := c.ShouldBindJSON(&supplier); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if err := s.db.Create(&supplier).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create supplier"})
		return
	}

	c.JSON(201, gin.H{"supplier": supplier})
}

func (s *Service) UpdateSupplier(c *gin.Context) {
	id := c.Param("id")
	supplierID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid supplier ID"})
		return
	}

	var supplier models.Supplier
	if err := s.db.Where("id = ?", supplierID).First(&supplier).Error; err != nil {
		c.JSON(404, gin.H{"error": "Supplier not found"})
		return
	}

	if err := c.ShouldBindJSON(&supplier); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if err := s.db.Save(&supplier).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update supplier"})
		return
	}

	c.JSON(200, gin.H{"supplier": supplier})
}

func (s *Service) GetPurchaseOrders(c *gin.Context) {
	var orders []models.PurchaseOrder
	if err := s.db.Find(&orders).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch purchase orders"})
		return
	}
	c.JSON(200, gin.H{"purchase_orders": orders})
}

func (s *Service) CreatePurchaseOrder(c *gin.Context) {
	var order models.PurchaseOrder
	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if err := s.db.Create(&order).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create purchase order"})
		return
	}

	c.JSON(201, gin.H{"purchase_order": order})
}

func (s *Service) UpdatePurchaseOrder(c *gin.Context) {
	id := c.Param("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid purchase order ID"})
		return
	}

	var order models.PurchaseOrder
	if err := s.db.Where("id = ?", orderID).First(&order).Error; err != nil {
		c.JSON(404, gin.H{"error": "Purchase order not found"})
		return
	}

	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if err := s.db.Save(&order).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update purchase order"})
		return
	}

	c.JSON(200, gin.H{"purchase_order": order})
}
