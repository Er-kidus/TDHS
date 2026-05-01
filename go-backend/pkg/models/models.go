package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a system user
type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email        string     `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash  string     `gorm:"not null" json:"-"`
	FirstName    string     `gorm:"not null" json:"first_name"`
	LastName     string     `gorm:"not null" json:"last_name"`
	Role         string     `gorm:"not null" json:"role"`
	HospitalID   *uuid.UUID `gorm:"index" json:"hospital_id"`
	NationalID   string     `gorm:"uniqueIndex" json:"national_id"`
	Phone        string     `json:"phone"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
	
	// Relationships
	Hospital     *Hospital            `gorm:"foreignKey:HospitalID" json:"hospital,omitempty"`
	Prescriptions []Prescription       `gorm:"foreignKey:DoctorID" json:"prescriptions,omitempty"`
}

// Hospital represents a healthcare facility
type Hospital struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name          string    `gorm:"not null" json:"name"`
	Region        string    `gorm:"not null" json:"region"`
	Address       string    `json:"address"`
	APIKey        string    `gorm:"uniqueIndex;not null" json:"api_key"`
	ContactEmail  string    `json:"contact_email"`
	LicenseNumber string    `json:"license_number"`
	CreatedAt     time.Time `json:"created_at"`
	
	// Relationships
	Users      []User              `gorm:"foreignKey:HospitalID" json:"users,omitempty"`
	Inventory  []PharmacyInventory  `gorm:"foreignKey:PharmacyID" json:"inventory,omitempty"`
}

// Medicine represents a drug/medication
type Medicine struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	GenericName  string    `json:"generic_name"`
	Category     string    `json:"category"`
	Manufacturer string    `json:"manufacturer"`
	NDCNumber    string    `gorm:"uniqueIndex" json:"ndc_number"`
	Description  string    `json:"description"`
	Strength     string    `json:"strength"`
	Form         string    `json:"form"`
	IsControlled bool      `gorm:"default:false" json:"is_controlled"`
	CreatedAt    time.Time `json:"created_at"`
	
	// Relationships
	InventoryItems []PharmacyInventory `gorm:"foreignKey:MedicineID" json:"inventory_items,omitempty"`
	PrescriptionItems []PrescriptionItem `gorm:"foreignKey:MedicineID" json:"prescription_items,omitempty"`
}

// PharmacyInventory represents inventory at a specific pharmacy
type PharmacyInventory struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PharmacyID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"pharmacy_id"`
	MedicineID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"medicine_id"`
	QuantityOnHand  int        `gorm:"not null;default:0" json:"quantity_on_hand"`
	ReorderLevel    int        `gorm:"default:10" json:"reorder_level"`
	UnitPrice       float64    `gorm:"type:decimal(10,2)" json:"unit_price"`
	ExpiryDate      time.Time  `json:"expiry_date"`
	BatchNumber     string     `gorm:"uniqueIndex" json:"batch_number"`
	ReceivedDate    time.Time  `gorm:"default:CURRENT_DATE" json:"received_date"`
	Location        string     `json:"location"`
	IsControlled    bool       `gorm:"default:false" json:"is_controlled"` // Controlled substance
	StorageCondition string     `json:"storage_condition"` // Temperature, humidity requirements
	LastStockCheck  time.Time  `json:"last_stock_check"` // Last inventory check
	MinOrderQty     int        `gorm:"default:20" json:"min_order_qty"` // Minimum order quantity
	SupplierID      *uuid.UUID `gorm:"type:uuid" json:"supplier_id"` // Preferred supplier
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	
	// Relationships
	Pharmacy *Hospital `gorm:"foreignKey:PharmacyID" json:"pharmacy,omitempty"`
	Medicine *Medicine `gorm:"foreignKey:MedicineID" json:"medicine,omitempty"`
	Supplier *Supplier `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
}

// Patient represents a patient in the EMR system
type Patient struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	NationalID   string     `gorm:"uniqueIndex;not null" json:"national_id"` // National patient ID
	FirstName    string     `gorm:"not null" json:"first_name"`
	LastName     string     `gorm:"not null" json:"last_name"`
	DateOfBirth  time.Time  `gorm:"not null" json:"date_of_birth"`
	Gender       string     `gorm:"not null" json:"gender"` // male, female, other
	Phone        string     `gorm:"uniqueIndex" json:"phone"`
	Email        string     `gorm:"uniqueIndex" json:"email"`
	Address      string     `gorm:"type:text" json:"address"`
	City         string     `json:"city"`
	State        string     `json:"state"`
	PostalCode   string     `json:"postal_code"`
	Country      string     `json:"country"`
	EmergencyContactName  string `json:"emergency_contact_name"`
	EmergencyContactPhone string `json:"emergency_contact_phone"`
	BloodType   string     `json:"blood_type"`
	Allergies   string     `gorm:"type:text" json:"allergies"`
	MedicalNotes string    `gorm:"type:text" json:"medical_notes"`
	IsActive    bool       `gorm:"default:true" json:"is_active"` // Patient status
	LastVisit   time.Time  `json:"last_visit"` // Last recorded visit
	PrimaryHospitalID uuid.UUID `gorm:"type:uuid" json:"primary_hospital_id"` // Primary hospital
	InsuranceProvider string `json:"insurance_provider"` // Insurance info
	InsuranceNumber   string `json:"insurance_number"` // Insurance policy number
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	
	// Relationships
	Prescriptions []Prescription `gorm:"foreignKey:PatientID" json:"prescriptions,omitempty"`
	MedicalRecords []MedicalRecord `gorm:"foreignKey:PatientID" json:"medical_records,omitempty"`
	PrimaryHospital Hospital `gorm:"foreignKey:PrimaryHospitalID" json:"primary_hospital,omitempty"`
}

// Prescription represents a medical prescription
type Prescription struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PrescriptionNumber string    `gorm:"uniqueIndex;not null" json:"prescription_number"`
	PatientID          uuid.UUID `gorm:"type:uuid;not null" json:"patient_id"`
	DoctorID           uuid.UUID `gorm:"type:uuid;not null" json:"doctor_id"`
	HospitalID         uuid.UUID `gorm:"type:uuid;not null" json:"hospital_id"`
	DatePrescribed     time.Time `gorm:"not null" json:"date_prescribed"`
	Status             string    `gorm:"default:'pending'" json:"status"` // pending, filled, cancelled, expired
	Notes              string    `gorm:"type:text" json:"notes"`
	QRCode             string    `gorm:"type:text" json:"qr_code"`
	QRCodeHash         string    `gorm:"type:varchar(255);uniqueIndex" json:"qr_code_hash"` // Anti-fraud verification
	ValidUntil         time.Time `gorm:"not null" json:"valid_until"` // Prescription expiry
	IsControlled       bool      `gorm:"default:false" json:"is_controlled"` // Controlled substance flag
	VerificationCount  int       `gorm:"default:0" json:"verification_count"` // Track verification attempts
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	// Relationships
	Patient            Patient          `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor             User             `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Hospital           Hospital         `gorm:"foreignKey:HospitalID" json:"hospital,omitempty"`
	PrescriptionItems  []PrescriptionItem `gorm:"foreignKey:PrescriptionID" json:"prescription_items,omitempty"`
	Sales     []SalesTransaction `gorm:"foreignKey:PrescriptionID" json:"sales,omitempty"`
}

// PrescriptionItem represents individual medicines in a prescription
type PrescriptionItem struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PrescriptionID uuid.UUID `gorm:"not null;index" json:"prescription_id"`
	MedicineID     uuid.UUID `gorm:"not null;index" json:"medicine_id"`
	Dosage         string     `gorm:"not null" json:"dosage"`
	Frequency       string     `gorm:"not null" json:"frequency"`
	Duration        string     `gorm:"not null" json:"duration"`
	Quantity        int        `gorm:"not null" json:"quantity"`
	Instructions    string     `gorm:"type:text" json:"instructions"`
	CreatedAt       time.Time  `json:"created_at"`
	
	// Relationships
	Prescription *Prescription `gorm:"foreignKey:PrescriptionID" json:"prescription,omitempty"`
	Medicine     *Medicine      `gorm:"foreignKey:MedicineID" json:"medicine,omitempty"`
}

// SalesTransaction represents a pharmacy sale
type SalesTransaction struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PrescriptionID   *uuid.UUID `gorm:"index" json:"prescription_id"`
	PharmacyID       uuid.UUID  `gorm:"not null;index" json:"pharmacy_id"`
	PatientID        uuid.UUID  `gorm:"not null;index" json:"patient_id"`
	TotalAmount      float64    `gorm:"not null" json:"total_amount"`
	PaymentMethod    string     `gorm:"not null" json:"payment_method"`
	TransactionDate  time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"transaction_date"`
	CashierID        uuid.UUID  `gorm:"not null;index" json:"cashier_id"`
	Status           string     `gorm:"default:'completed';check:status IN ('completed', 'pending', 'cancelled')" json:"status"`
	CreatedAt        time.Time  `json:"created_at"`
	
	// Relationships
	Prescription *Prescription `gorm:"foreignKey:PrescriptionID" json:"prescription,omitempty"`
	Pharmacy     *Hospital      `gorm:"foreignKey:PharmacyID" json:"pharmacy,omitempty"`
	Patient      *Patient       `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Cashier      *User          `gorm:"foreignKey:CashierID" json:"cashier,omitempty"`
}

// InventoryTransaction tracks stock movements
type InventoryTransaction struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PharmacyID     uuid.UUID  `gorm:"not null;index" json:"pharmacy_id"`
	MedicineID     uuid.UUID  `gorm:"not null;index" json:"medicine_id"`
	TransactionType string     `gorm:"not null;check:transaction_type IN ('in', 'out', 'transfer', 'adjustment')" json:"transaction_type"`
	Quantity       int        `gorm:"not null" json:"quantity"`
	ReferenceID    *uuid.UUID `gorm:"index" json:"reference_id"`
	Notes          string     `gorm:"type:text" json:"notes"`
	CreatedBy      uuid.UUID  `gorm:"not null;index" json:"created_by"`
	CreatedAt      time.Time  `json:"created_at"`
	
	// Relationships
	Pharmacy *Hospital `gorm:"foreignKey:PharmacyID" json:"pharmacy,omitempty"`
	Medicine *Medicine `gorm:"foreignKey:MedicineID" json:"medicine,omitempty"`
	Creator  *User     `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

// Supplier represents a medicine supplier
type Supplier struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name          string    `gorm:"not null" json:"name"`
	ContactPerson string    `json:"contact_person"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
	Address       string    `gorm:"type:text" json:"address"`
	LicenseNumber string    `json:"license_number"`
	CreatedAt     time.Time `json:"created_at"`
}

// PurchaseOrder represents orders from suppliers
type PurchaseOrder struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PharmacyID          uuid.UUID  `gorm:"not null;index" json:"pharmacy_id"`
	SupplierID          uuid.UUID  `gorm:"not null;index" json:"supplier_id"`
	OrderNumber         string     `gorm:"uniqueIndex;not null" json:"order_number"`
	Status              string     `gorm:"default:'pending';check:status IN ('pending', 'approved', 'received', 'cancelled')" json:"status"`
	TotalAmount         float64    `json:"total_amount"`
	OrderDate           time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"order_date"`
	ExpectedDeliveryDate time.Time  `json:"expected_delivery_date"`
	CreatedBy           uuid.UUID  `gorm:"not null;index" json:"created_by"`
	CreatedAt           time.Time  `json:"created_at"`
	
	// Relationships
	Pharmacy *Hospital `gorm:"foreignKey:PharmacyID" json:"pharmacy,omitempty"`
	Supplier *Supplier `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	Creator  *User     `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

// MedicalRecord represents patient medical history
type MedicalRecord struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PatientID   uuid.UUID  `gorm:"not null;index" json:"patient_id"`
	DoctorID    uuid.UUID  `gorm:"not null;index" json:"doctor_id"`
	HospitalID  uuid.UUID  `gorm:"not null;index" json:"hospital_id"`
	Diagnosis   string     `gorm:"type:text" json:"diagnosis"`
	Treatment   string     `gorm:"type:text" json:"treatment"`
	Notes       string     `gorm:"type:text" json:"notes"`
	VisitDate   time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"visit_date"`
	CreatedAt   time.Time  `json:"created_at"`
	
	// Relationships
	Patient  *Patient  `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor   *User     `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Hospital *Hospital `gorm:"foreignKey:HospitalID" json:"hospital,omitempty"`
}

// Allergy represents patient allergies
type Allergy struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PatientID uuid.UUID `gorm:"not null;index" json:"patient_id"`
	Allergen  string    `gorm:"not null" json:"allergen"`
	Severity  string    `json:"severity"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	
	// Relationships
	Patient *Patient `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
}

// Condition represents patient medical conditions
type Condition struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PatientID   uuid.UUID  `gorm:"not null;index" json:"patient_id"`
	Condition   string     `gorm:"not null" json:"condition"`
	DiagnosisDate time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"diagnosis_date"`
	Status      string     `json:"status"`
	Notes       string     `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	
	// Relationships
	Patient *Patient `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
}
