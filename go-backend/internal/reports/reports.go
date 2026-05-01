package reports

import (
	"fmt"
	"time"
	"pharmacy-system/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

type SalesReportRequest struct {
	StartDate string `json:"start_date" binding:"required"`
	EndDate   string `json:"end_date" binding:"required"`
	PharmacyID *uuid.UUID `json:"pharmacy_id"`
}

type InventoryReportRequest struct {
	PharmacyID uuid.UUID `json:"pharmacy_id" binding:"required"`
	ReportType string     `json:"report_type" binding:"required,oneof=low_stock expiry valuation"`
}

type PrescriptionReportRequest struct {
	StartDate string `json:"start_date" binding:"required"`
	EndDate   string `json:"end_date" binding:"required"`
	DoctorID  *uuid.UUID `json:"doctor_id"`
	Status    string     `json:"status"`
}

type SalesReport struct {
	Date           time.Time `json:"date"`
	TotalSales     float64   `json:"total_sales"`
	TransactionCount int       `json:"transaction_count"`
	PrescriptionCount int    `json:"prescription_count"`
}

type InventoryReport struct {
	MedicineName   string  `json:"medicine_name"`
	CurrentStock   int     `json:"current_stock"`
	ReorderLevel   int     `json:"reorder_level"`
	UnitPrice      float64 `json:"unit_price"`
	TotalValue     float64 `json:"total_value"`
	ExpiryDate     time.Time `json:"expiry_date"`
	DaysToExpiry  int     `json:"days_to_expiry"`
}

type PrescriptionReport struct {
	PrescriptionNumber string    `json:"prescription_number"`
	PatientName       string    `json:"patient_name"`
	DoctorName        string    `json:"doctor_name"`
	DatePrescribed    time.Time `json:"date_prescribed"`
	Status            string    `json:"status"`
	TotalItems        int       `json:"total_items"`
}

type Analytics struct {
	TotalPatients      int     `json:"total_patients"`
	TotalMedicines    int     `json:"total_medicines"`
	TotalPrescriptions int     `json:"total_prescriptions"`
	TotalSales        float64 `json:"total_sales"`
	LowStockItems     int     `json:"low_stock_items"`
	ExpiredItems      int     `json:"expired_items"`
	PendingPrescriptions int     `json:"pending_prescriptions"`
	FilledPrescriptions  int     `json:"filled_prescriptions"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetSalesReport(c *gin.Context) {
	var req SalesReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Parse dates
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid start date format"})
		return
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid end date format"})
		return
	}

	// Query sales data
	var sales []models.SalesTransaction
	query := s.db.Where("transaction_date BETWEEN ? AND ?", startDate, endDate)
	
	if req.PharmacyID != nil {
		query = query.Where("pharmacy_id = ?", *req.PharmacyID)
	}

	if err := query.Find(&sales).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch sales data"})
		return
	}

	// Group by date
	var reports []SalesReport
	s.db.Raw(`
		SELECT 
			DATE(transaction_date) as date,
			COALESCE(SUM(total_amount), 0) as total_sales,
			COUNT(*) as transaction_count,
			COUNT(CASE WHEN prescription_id IS NOT NULL THEN 1 END) as prescription_count
		FROM sales_transactions 
		WHERE transaction_date BETWEEN ? AND ?
			` + getPharmacyFilter(req.PharmacyID) + `
		GROUP BY DATE(transaction_date)
		ORDER BY date DESC
	`, startDate, endDate).Scan(&reports)

	c.JSON(200, gin.H{"sales_report": reports})
}

func (s *Service) GetInventoryReport(c *gin.Context) {
	var req InventoryReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	var reports []InventoryReport
	var query string

	switch req.ReportType {
	case "low_stock":
		query = `
			SELECT 
				m.name as medicine_name,
				pi.quantity_on_hand as current_stock,
				pi.reorder_level,
				pi.unit_price,
				pi.quantity_on_hand * pi.unit_price as total_value,
				pi.expiry_date,
				EXTRACT(DAYS FROM pi.expiry_date - CURRENT_DATE) as days_to_expiry
			FROM pharmacy_inventory pi
			JOIN medicines m ON pi.medicine_id = m.id
			WHERE pi.pharmacy_id = ? AND pi.quantity_on_hand <= pi.reorder_level
			ORDER BY days_to_expiry ASC
		`
	case "expiry":
		query = `
			SELECT 
				m.name as medicine_name,
				pi.quantity_on_hand as current_stock,
				pi.reorder_level,
				pi.unit_price,
				pi.quantity_on_hand * pi.unit_price as total_value,
				pi.expiry_date,
				EXTRACT(DAYS FROM pi.expiry_date - CURRENT_DATE) as days_to_expiry
			FROM pharmacy_inventory pi
			JOIN medicines m ON pi.medicine_id = m.id
			WHERE pi.pharmacy_id = ? AND pi.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
			ORDER BY pi.expiry_date ASC
		`
	case "valuation":
		query = `
			SELECT 
				m.name as medicine_name,
				pi.quantity_on_hand as current_stock,
				pi.reorder_level,
				pi.unit_price,
				pi.quantity_on_hand * pi.unit_price as total_value,
				pi.expiry_date,
				EXTRACT(DAYS FROM pi.expiry_date - CURRENT_DATE) as days_to_expiry
			FROM pharmacy_inventory pi
			JOIN medicines m ON pi.medicine_id = m.id
			WHERE pi.pharmacy_id = ?
			ORDER BY total_value DESC
		`
	}

	if err := s.db.Raw(query, req.PharmacyID).Scan(&reports).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate inventory report"})
		return
	}

	c.JSON(200, gin.H{"inventory_report": reports})
}

func (s *Service) GetPrescriptionReport(c *gin.Context) {
	var req PrescriptionReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Parse dates
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid start date format"})
		return
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid end date format"})
		return
	}

	// Query prescription data
	var reports []PrescriptionReport
	query := s.db.Table("prescriptions p").
		Select(`
			p.prescription_number,
			CONCAT(pa.first_name, ' ', pa.last_name) as patient_name,
			CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
			p.date_prescribed,
			p.status,
			COUNT(pi.id) as total_items
		`).
		Joins("LEFT JOIN patients pa ON p.patient_id = pa.id").
		Joins("LEFT JOIN users u ON p.doctor_id = u.id").
		Joins("LEFT JOIN prescription_items pi ON p.id = pi.prescription_id").
		Where("p.date_prescribed BETWEEN ? AND ?", startDate, endDate)

	if req.DoctorID != nil {
		query = query.Where("p.doctor_id = ?", *req.DoctorID)
	}

	if req.Status != "" {
		query = query.Where("p.status = ?", req.Status)
	}

	if err := query.Group("p.id").Order("p.date_prescribed DESC").Scan(&reports).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch prescription data"})
		return
	}

	c.JSON(200, gin.H{"prescription_report": reports})
}

func (s *Service) GetAnalytics(c *gin.Context) {
	pharmacyID := c.Query("pharmacy_id")
	if pharmacyID == "" {
		c.JSON(400, gin.H{"error": "pharmacy_id is required"})
		return
	}

	var analytics Analytics

	// Get various counts
	s.db.Model(&models.Patient{}).Count(&analytics.TotalPatients)
	s.db.Model(&models.Medicine{}).Count(&analytics.TotalMedicines)
	s.db.Model(&models.Prescription{}).Count(&analytics.TotalPrescriptions)

	// Get sales total
	var totalSales float64
	s.db.Model(&models.SalesTransaction{}).
		Select("COALESCE(SUM(total_amount), 0)").
		Where("pharmacy_id = ?", pharmacyID).
		Scan(&totalSales)
	analytics.TotalSales = totalSales

	// Get low stock items
	var lowStockCount int64
	s.db.Model(&models.PharmacyInventory{}).
		Where("pharmacy_id = ? AND quantity_on_hand <= reorder_level", pharmacyID).
		Count(&lowStockCount)
	analytics.LowStockItems = int(lowStockCount)

	// Get expired items
	var expiredCount int64
	s.db.Model(&models.PharmacyInventory{}).
		Where("pharmacy_id = ? AND expiry_date <= CURRENT_DATE", pharmacyID).
		Count(&expiredCount)
	analytics.ExpiredItems = int(expiredCount)

	// Get prescription counts by status
	s.db.Model(&models.Prescription{}).
		Where("status = ?", "pending").
		Count(&analytics.PendingPrescriptions)
	
	s.db.Model(&models.Prescription{}).
		Where("status = ?", "filled").
		Count(&analytics.FilledPrescriptions)

	c.JSON(200, gin.H{"analytics": analytics})
}

func (s *Service) GetMostSoldMedicines(c *gin.Context) {
	pharmacyID := c.Query("pharmacy_id")
	if pharmacyID == "" {
		c.JSON(400, gin.H{"error": "pharmacy_id is required"})
		return
	}

	type MedicineSales struct {
		MedicineName string  `json:"medicine_name"`
		TotalQuantity int     `json:"total_quantity"`
		TotalRevenue  float64 `json:"total_revenue"`
		SalesCount    int     `json:"sales_count"`
	}

	var medicines []MedicineSales
	s.db.Raw(`
		SELECT 
			m.name as medicine_name,
			SUM(pi.quantity) as total_quantity,
			SUM(pi.quantity * pi.unit_price) as total_revenue,
			COUNT(DISTINCT st.id) as sales_count
		FROM sales_transactions st
		JOIN prescription_items pi ON st.prescription_id = pi.prescription_id
		JOIN medicines m ON pi.medicine_id = m.id
		WHERE st.pharmacy_id = ?
			AND st.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY m.id
		ORDER BY total_revenue DESC
		LIMIT 10
	`, pharmacyID).Scan(&medicines)

	c.JSON(200, gin.H{"most_sold_medicines": medicines})
}

func (s *Service) GetPatientDemographics(c *gin.Context) {
	type Demographics struct {
		AgeGroup string `json:"age_group"`
		Count    int    `json:"count"`
		Percentage float64 `json:"percentage"`
	}

	var demographics []Demographics
	s.db.Raw(`
		SELECT 
			CASE 
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 0 AND 18 THEN '0-18'
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 19 AND 35 THEN '19-35'
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 36 AND 50 THEN '36-50'
				WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) BETWEEN 51 AND 65 THEN '51-65'
				ELSE '65+'
			END as age_group,
			COUNT(*) as count,
			ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM patients), 2) as percentage
		FROM patients
		GROUP BY age_group
		ORDER BY age_group
	`).Scan(&demographics)

	c.JSON(200, gin.H{"patient_demographics": demographics})
}

func (s *Service) ExportReport(c *gin.Context) {
	reportType := c.Query("type")
	pharmacyID := c.Query("pharmacy_id")
	format := c.DefaultQuery("format", "json")

	var data interface{}
	switch reportType {
	case "sales":
		data = s.getSalesData(pharmacyID)
	case "inventory":
		data = s.getInventoryData(pharmacyID)
	case "prescriptions":
		data = s.getPrescriptionData(pharmacyID)
	default:
		c.JSON(400, gin.H{"error": "Invalid report type"})
		return
	}

	if format == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s_report.csv", reportType))
		// Convert data to CSV and write response
		c.String(200, s.convertToCSV(data))
	} else {
		c.JSON(200, gin.H{"data": data})
	}
}

func getPharmacyFilter(pharmacyID *uuid.UUID) string {
	if pharmacyID != nil {
		return fmt.Sprintf("AND pharmacy_id = '%s'", pharmacyID.String())
	}
	return ""
}

func (s *Service) getSalesData(pharmacyID string) interface{} {
	// Implementation for sales data export
	return map[string]interface{}{"message": "Sales data export"}
}

func (s *Service) getInventoryData(pharmacyID string) interface{} {
	// Implementation for inventory data export
	return map[string]interface{}{"message": "Inventory data export"}
}

func (s *Service) getPrescriptionData(pharmacyID string) interface{} {
	// Implementation for prescription data export
	return map[string]interface{}{"message": "Prescription data export"}
}

func (s *Service) convertToCSV(data interface{}) string {
	// Convert data to CSV format
	return "CSV,data,here"
}
