package prescription

import (
	"crypto/md5"
	"fmt"
	"pharmacy-system/pkg/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/qpliu/qrcode"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

type CreatePrescriptionRequest struct {
	PatientID uuid.UUID `json:"patient_id" binding:"required"`
	DoctorID  uuid.UUID `json:"doctor_id" binding:"required"`
	HospitalID uuid.UUID `json:"hospital_id" binding:"required"`
	Notes      string     `json:"notes"`
	Items      []PrescriptionItemRequest `json:"items" binding:"required,min=1"`
}

type PrescriptionItemRequest struct {
	MedicineID  uuid.UUID `json:"medicine_id" binding:"required"`
	Dosage      string     `json:"dosage" binding:"required"`
	Frequency    string     `json:"frequency" binding:"required"`
	Duration     string     `json:"duration" binding:"required"`
	Quantity     int        `json:"quantity" binding:"required,min=1"`
	Instructions string     `json:"instructions"`
}

type FillPrescriptionRequest struct {
	PharmacyID uuid.UUID `json:"pharmacy_id" binding:"required"`
	Notes       string     `json:"notes"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetPrescriptions(c *gin.Context) {
	var prescriptions []models.Prescription
	if err := s.db.Find(&prescriptions).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch prescriptions"})
		return
	}
	c.JSON(200, gin.H{"prescriptions": prescriptions})
}

func (s *Service) GetPrescription(c *gin.Context) {
	id := c.Param("id")
	prescriptionID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var prescription models.Prescription
	if err := s.db.Where("id = ?", prescriptionID).First(&prescription).Error; err != nil {
		c.JSON(404, gin.H{"error": "Prescription not found"})
		return
	}

	c.JSON(200, gin.H{"prescription": prescription})
}

func (s *Service) CreatePrescription(c *gin.Context) {
	var req CreatePrescriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Generate prescription number
	prescriptionNumber := fmt.Sprintf("RX%s", uuid.New().String()[:8].ToUpper())

	// Set valid until date (typically 6 months from now)
	validUntil := time.Now().AddDate(0, 6, 0)

	// Create prescription
	prescription := models.Prescription{
		PrescriptionNumber: prescriptionNumber,
		PatientID:          req.PatientID,
		DoctorID:           req.DoctorID,
		HospitalID:         req.HospitalID,
		Notes:              req.Notes,
		Status:             "pending",
		ValidUntil:         validUntil,
	}

	if err := s.db.Create(&prescription).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create prescription"})
		return
	}

	// Create prescription items
	var isControlled bool
	for _, item := range req.Items {
		prescriptionItem := models.PrescriptionItem{
			PrescriptionID: prescription.ID,
			MedicineID:     item.MedicineID,
			Dosage:         item.Dosage,
			Frequency:       item.Frequency,
			Duration:        item.Duration,
			Quantity:        item.Quantity,
			Instructions:    item.Instructions,
		}
		s.db.Create(&prescriptionItem)

		// Check if any medicine is controlled
		var medicine models.Medicine
		if err := s.db.First(&medicine, item.MedicineID).Error; err == nil {
			if medicine.IsControlled {
				isControlled = true
			}
		}
	}

	// Update controlled substance flag
	prescription.IsControlled = isControlled

	// Generate QR code
	qrCode, err := s.generateQRCode(prescription.ID.String())
	if err != nil {
		s.db.Delete(&prescription) // Cleanup on failure
		c.JSON(500, gin.H{"error": "Failed to generate QR code"})
		return
	}

	// Generate QR code hash for anti-fraud verification
	qrHash := s.generateQRHash(prescriptionNumber, req.PatientID.String(), validUntil)

	// Update prescription with QR code and hash
	prescription.QRCode = qrCode
	prescription.QRCodeHash = qrHash
	s.db.Save(&prescription)

	c.JSON(201, gin.H{"prescription": prescription})
}

func (s *Service) UpdatePrescription(c *gin.Context) {
	id := c.Param("id")
	prescriptionID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var prescription models.Prescription
	if err := s.db.Where("id = ?", prescriptionID).First(&prescription).Error; err != nil {
		c.JSON(404, gin.H{"error": "Prescription not found"})
		return
	}

	if err := c.ShouldBindJSON(&prescription); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if err := s.db.Save(&prescription).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update prescription"})
		return
	}

	c.JSON(200, gin.H{"prescription": prescription})
}

func (s *Service) DeletePrescription(c *gin.Context) {
	id := c.Param("id")
	prescriptionID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid prescription ID"})
		return
	}

	if err := s.db.Delete(&models.Prescription{}, prescriptionID).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete prescription"})
		return
	}

	c.JSON(200, gin.H{"message": "Prescription deleted successfully"})
}

func (s *Service) GenerateQRCode(c *gin.Context) {
	id := c.Param("id")
	prescriptionID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var prescription models.Prescription
	if err := s.db.Where("id = ?", prescriptionID).First(&prescription).Error; err != nil {
		c.JSON(404, gin.H{"error": "Prescription not found"})
		return
	}

	qrCode, err := s.generateQRCode(prescriptionID.String())
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate QR code"})
		return
	}

	c.JSON(200, gin.H{
		"qr_code": qrCode,
		"prescription_number": prescription.PrescriptionNumber,
	})
}

func (s *Service) ValidatePrescription(c *gin.Context) {
	id := c.Param("id")
	prescriptionID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var prescription models.Prescription
	if err := s.db.Where("id = ?", prescriptionID).First(&prescription).Error; err != nil {
		c.JSON(404, gin.H{"error": "Prescription not found"})
		return
	}

	// Check if prescription is already filled
	if prescription.Status == "filled" {
		c.JSON(400, gin.H{"error": "Prescription already filled"})
		return
	}

	// Check if prescription is expired
	if prescription.Status == "expired" {
		c.JSON(400, gin.H{"error": "Prescription has expired"})
		return
	}

	c.JSON(200, gin.H{
		"valid": true,
		"prescription": prescription,
	})
}

func (s *Service) FillPrescription(c *gin.Context) {
	id := c.Param("id")
	prescriptionID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var req FillPrescriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	var prescription models.Prescription
	if err := s.db.Where("id = ?", prescriptionID).First(&prescription).Error; err != nil {
		c.JSON(404, gin.H{"error": "Prescription not found"})
		return
	}

	// Update prescription status
	prescription.Status = "filled"
	if err := s.db.Save(&prescription).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update prescription"})
		return
	}

	// Create inventory transactions for each item
	var items []models.PrescriptionItem
	s.db.Where("prescription_id = ?", prescriptionID).Find(&items)

	for _, item := range items {
		transaction := models.InventoryTransaction{
			PharmacyID:     req.PharmacyID,
			MedicineID:     item.MedicineID,
			TransactionType: "out",
			Quantity:       item.Quantity,
			ReferenceID:    &prescription.ID,
			Notes:          fmt.Sprintf("Prescription fill: %s", prescription.PrescriptionNumber),
		}
		s.db.Create(&transaction)

		// Update inventory
		var inventory models.PharmacyInventory
		if err := s.db.Where("medicine_id = ? AND pharmacy_id = ?", item.MedicineID, req.PharmacyID).First(&inventory).Error; err == nil {
			inventory.QuantityOnHand -= item.Quantity
			s.db.Save(&inventory)
		}
	}

	c.JSON(200, gin.H{
		"message": "Prescription filled successfully",
		"prescription": prescription,
	})
}

func (s *Service) GetPatientPrescriptions(c *gin.Context) {
	id := c.Param("patientId")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var prescriptions []models.Prescription
	if err := s.db.Where("patient_id = ?", patientID).Order("date_prescribed DESC").Find(&prescriptions).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch patient prescriptions"})
		return
	}

	c.JSON(200, gin.H{"prescriptions": prescriptions})
}

func (s *Service) GetDoctorPrescriptions(c *gin.Context) {
	id := c.Param("doctorId")
	doctorID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid doctor ID"})
		return
	}

	var prescriptions []models.Prescription
	if err := s.db.Where("doctor_id = ?", doctorID).Order("date_prescribed DESC").Find(&prescriptions).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch doctor prescriptions"})
		return
	}

	c.JSON(200, gin.H{"prescriptions": prescriptions})
}

func (s *Service) generateQRCode(prescriptionID string) (string, error) {
	// Generate QR code for prescription
	qrData := fmt.Sprintf("https://pharmacy.system/prescription/%s", prescriptionID)
	qr, err := qrcode.New(qrData)
	if err != nil {
		return "", err
	}
	
	// Convert to base64 for JSON response
	qrImage, err := qr.PNG(256)
	if err != nil {
		return "", err
	}
	
	return fmt.Sprintf("data:image/png;base64,%v", qrImage), nil
}

func (s *Service) generateQRHash(prescriptionNumber, patientID string, validUntil time.Time) string {
	// Generate hash for anti-fraud verification
	data := fmt.Sprintf("%s|%s|%s", prescriptionNumber, patientID, validUntil.Format("2006-01-02"))
	hash := fmt.Sprintf("%x", md5.Sum([]byte(data)))
	return hash
}

func (s *Service) ValidatePrescriptionHash(c *gin.Context) {
	id := c.Param("id")
	prescriptionID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid prescription ID"})
		return
	}

	var req struct {
		QRHash string `json:"qr_hash" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	var prescription models.Prescription
	if err := s.db.Where("id = ?", prescriptionID).First(&prescription).Error; err != nil {
		c.JSON(404, gin.H{"error": "Prescription not found"})
		return
	}

	// Verify QR hash
	expectedHash := s.generateQRHash(
		prescription.PrescriptionNumber,
		prescription.PatientID.String(),
		prescription.ValidUntil,
	)

	isValid := req.QRHash == expectedHash

	// Increment verification count
	prescription.VerificationCount++
	s.db.Save(&prescription)

	c.JSON(200, gin.H{
		"valid": isValid,
		"prescription": prescription,
		"verification_count": prescription.VerificationCount,
	})
}
