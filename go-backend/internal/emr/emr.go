package emr

import (
	"pharmacy-system/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

type CreatePatientRequest struct {
	NationalID string `json:"national_id" binding:"required"`
	FirstName  string `json:"first_name" binding:"required"`
	LastName   string `json:"last_name" binding:"required"`
	DateOfBirth string `json:"date_of_birth" binding:"required"`
	Gender     string `json:"gender" binding:"required,oneof=male female other"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	Address    string `json:"address"`
	BloodType  string `json:"blood_type"`
	Allergies  string `json:"allergies"`
}

type CreateMedicalRecordRequest struct {
	PatientID uuid.UUID `json:"patient_id" binding:"required"`
	Diagnosis string     `json:"diagnosis" binding:"required"`
	Treatment string     `json:"treatment" binding:"required"`
	Notes     string     `json:"notes"`
}

type AddAllergyRequest struct {
	Allergen string `json:"allergen" binding:"required"`
	Severity string `json:"severity"`
	Notes    string `json:"notes"`
}

type AddConditionRequest struct {
	Condition string `json:"condition" binding:"required"`
	Status    string `json:"status"`
	Notes     string `json:"notes"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetPatients(c *gin.Context) {
	var patients []models.Patient
	if err := s.db.Find(&patients).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch patients"})
		return
	}
	c.JSON(200, gin.H{"patients": patients})
}

func (s *Service) CreatePatient(c *gin.Context) {
	var req CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Check if patient already exists
	var existingPatient models.Patient
	if err := s.db.Where("national_id = ?", req.NationalID).First(&existingPatient).Error; err == nil {
		c.JSON(409, gin.H{"error": "Patient already exists"})
		return
	}

	patient := models.Patient{
		NationalID: req.NationalID,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Gender:     req.Gender,
		Phone:      req.Phone,
		Email:      req.Email,
		Address:    req.Address,
		BloodType:  req.BloodType,
		Allergies:  req.Allergies,
	}

	if err := s.db.Create(&patient).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create patient"})
		return
	}

	c.JSON(201, gin.H{"patient": patient})
}

func (s *Service) GetPatient(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var patient models.Patient
	if err := s.db.Where("id = ?", patientID).First(&patient).Error; err != nil {
		c.JSON(404, gin.H{"error": "Patient not found"})
		return
	}

	c.JSON(200, gin.H{"patient": patient})
}

func (s *Service) UpdatePatient(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var patient models.Patient
	if err := s.db.Where("id = ?", patientID).First(&patient).Error; err != nil {
		c.JSON(404, gin.H{"error": "Patient not found"})
		return
	}

	if err := c.ShouldBindJSON(&patient); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if err := s.db.Save(&patient).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update patient"})
		return
	}

	c.JSON(200, gin.H{"patient": patient})
}

func (s *Service) SearchPatients(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(400, gin.H{"error": "Search query is required"})
		return
	}

	var patients []models.Patient
	// Enhanced search for command palette - search by National ID, Phone, or Name
	if err := s.db.Where(
		"national_id ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ? OR phone ILIKE ? OR email ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%",
	).Where("is_active = ?", true). // Only return active patients
		Limit(20). // Limit results for performance
		Find(&patients).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to search patients"})
		return
	}

	c.JSON(200, gin.H{"patients": patients})
}

func (s *Service) GetPatientByNationalID(c *gin.Context) {
	nationalID := c.Param("nationalId")
	if nationalID == "" {
		c.JSON(400, gin.H{"error": "National ID is required"})
		return
	}

	var patient models.Patient
	if err := s.db.Where("national_id = ? AND is_active = ?", nationalID, true).First(&patient).Error; err != nil {
		c.JSON(404, gin.H{"error": "Patient not found"})
		return
	}

	c.JSON(200, gin.H{"patient": patient})
}

func (s *Service) GetMedicalHistory(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var medicalRecords []models.MedicalRecord
	if err := s.db.Where("patient_id = ?", patientID).Order("visit_date DESC").Find(&medicalRecords).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch medical history"})
		return
	}

	c.JSON(200, gin.H{"medical_history": medicalRecords})
}

func (s *Service) CreateMedicalRecord(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req CreateMedicalRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	medicalRecord := models.MedicalRecord{
		PatientID: patientID,
		Diagnosis: req.Diagnosis,
		Treatment: req.Treatment,
		Notes:     req.Notes,
	}

	if err := s.db.Create(&medicalRecord).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create medical record"})
		return
	}

	c.JSON(201, gin.H{"medical_record": medicalRecord})
}

func (s *Service) GetMedicalRecord(c *gin.Context) {
	id := c.Param("id")
	recordID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid medical record ID"})
		return
	}

	var medicalRecord models.MedicalRecord
	if err := s.db.Where("id = ?", recordID).First(&medicalRecord).Error; err != nil {
		c.JSON(404, gin.H{"error": "Medical record not found"})
		return
	}

	c.JSON(200, gin.H{"medical_record": medicalRecord})
}

func (s *Service) GetAllergies(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var allergies []models.Allergy
	if err := s.db.Where("patient_id = ?", patientID).Find(&allergies).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch allergies"})
		return
	}

	c.JSON(200, gin.H{"allergies": allergies})
}

func (s *Service) AddAllergy(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req AddAllergyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	allergy := models.Allergy{
		PatientID: patientID,
		Allergen:  req.Allergen,
		Severity:  req.Severity,
		Notes:     req.Notes,
	}

	if err := s.db.Create(&allergy).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to add allergy"})
		return
	}

	c.JSON(201, gin.H{"allergy": allergy})
}

func (s *Service) GetConditions(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var conditions []models.Condition
	if err := s.db.Where("patient_id = ?", patientID).Find(&conditions).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch conditions"})
		return
	}

	c.JSON(200, gin.H{"conditions": conditions})
}

func (s *Service) AddCondition(c *gin.Context) {
	id := c.Param("id")
	patientID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req AddConditionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	condition := models.Condition{
		PatientID: patientID,
		Condition:  req.Condition,
		Status:     req.Status,
		Notes:      req.Notes,
	}

	if err := s.db.Create(&condition).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to add condition"})
		return
	}

	c.JSON(201, gin.H{"condition": condition})
}
