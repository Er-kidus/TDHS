package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleAdmin       UserRole = "admin"
	RolePharmacist  UserRole = "pharmacist"
	RoleTechnician  UserRole = "technician"
	RoleDoctor      UserRole = "doctor"
	RolePatient     UserRole = "patient"
)

type User struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FirstName    string    `json:"first_name" db:"first_name"`
	LastName     string    `json:"last_name" db:"last_name"`
	Phone        *string   `json:"phone" db:"phone"`
	Role         UserRole  `json:"role" db:"role"`
	PharmacyID   *uuid.UUID `json:"pharmacy_id" db:"pharmacy_id"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
	IsActive     bool      `json:"is_active" db:"is_active"`
}

// Scan implements the sql.Scanner interface for UserRole
func (r *UserRole) Scan(value interface{}) error {
	if value == nil {
		*r = ""
		return nil
	}
	if str, ok := value.(string); ok {
		*r = UserRole(str)
		return nil
	}
	return nil
}

// Value implements the driver.Valuer interface for UserRole
func (r UserRole) Value() (driver.Value, error) {
	return string(r), nil
}

type Pharmacy struct {
	ID            uuid.UUID `json:"id" db:"id"`
	Name          string    `json:"name" db:"name"`
	LicenseNumber string    `json:"license_number" db:"license_number"`
	Address       string    `json:"address" db:"address"`
	Phone         *string   `json:"phone" db:"phone"`
	Email         *string   `json:"email" db:"email"`
	IsActive      bool      `json:"is_active" db:"is_active"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type Medication struct {
	ID                   uuid.UUID `json:"id" db:"id"`
	NDCCode              string    `json:"ndc_code" db:"ndc_code"`
	BrandName            string    `json:"brand_name" db:"brand_name"`
	GenericName          string    `json:"generic_name" db:"generic_name"`
	DosageForm           *string   `json:"dosage_form" db:"dosage_form"`
	Strength             *string   `json:"strength" db:"strength"`
	Manufacturer         *string   `json:"manufacturer" db:"manufacturer"`
	Description          *string   `json:"description" db:"description"`
	IsControlledSubstance bool     `json:"is_controlled_substance" db:"is_controlled_substance"`
	ScheduleLevel        *int      `json:"schedule_level" db:"schedule_level"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
}

type PrescriptionStatus string

const (
	StatusPending        PrescriptionStatus = "pending"
	StatusFilled         PrescriptionStatus = "filled"
	StatusPartiallyFilled PrescriptionStatus = "partially_filled"
	StatusCancelled      PrescriptionStatus = "cancelled"
	StatusExpired        PrescriptionStatus = "expired"
)

type Prescription struct {
	ID                uuid.UUID          `json:"id" db:"id"`
	PrescriptionNumber string             `json:"prescription_number" db:"prescription_number"`
	PatientID         uuid.UUID          `json:"patient_id" db:"patient_id"`
	DoctorID          uuid.UUID          `json:"doctor_id" db:"doctor_id"`
	PharmacyID        uuid.UUID          `json:"pharmacy_id" db:"pharmacy_id"`
	DatePrescribed    time.Time          `json:"date_prescribed" db:"date_prescribed"`
	DateFilled        *time.Time         `json:"date_filled" db:"date_filled"`
	Status            PrescriptionStatus `json:"status" db:"status"`
	Notes             *string            `json:"notes" db:"notes"`
	CreatedAt         time.Time          `json:"created_at" db:"created_at"`
}

// Scan implements the sql.Scanner interface for PrescriptionStatus
func (s *PrescriptionStatus) Scan(value interface{}) error {
	if value == nil {
		*s = ""
		return nil
	}
	if str, ok := value.(string); ok {
		*s = PrescriptionStatus(str)
		return nil
	}
	return nil
}

// Value implements the driver.Valuer interface for PrescriptionStatus
func (s PrescriptionStatus) Value() (driver.Value, error) {
	return string(s), nil
}

type PrescriptionItem struct {
	ID               uuid.UUID `json:"id" db:"id"`
	PrescriptionID   uuid.UUID `json:"prescription_id" db:"prescription_id"`
	MedicationID     uuid.UUID `json:"medication_id" db:"medication_id"`
	Dosage           *string   `json:"dosage" db:"dosage"`
	Frequency        *string   `json:"frequency" db:"frequency"`
	Duration         *string   `json:"duration" db:"duration"`
	Quantity         int       `json:"quantity" db:"quantity"`
	Instructions     *string   `json:"instructions" db:"instructions"`
	RefillsRemaining int       `json:"refills_remaining" db:"refills_remaining"`
}

type Inventory struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	PharmacyID    uuid.UUID  `json:"pharmacy_id" db:"pharmacy_id"`
	MedicationID  uuid.UUID  `json:"medication_id" db:"medication_id"`
	QuantityOnHand int       `json:"quantity_on_hand" db:"quantity_on_hand"`
	ReorderLevel  int        `json:"reorder_level" db:"reorder_level"`
	UnitCost      *float64   `json:"unit_cost" db:"unit_cost"`
	SellingPrice  *float64   `json:"selling_price" db:"selling_price"`
	ExpiryDate    *time.Time `json:"expiry_date" db:"expiry_date"`
	BatchNumber   *string    `json:"batch_number" db:"batch_number"`
	Supplier      *string    `json:"supplier" db:"supplier"`
	LastUpdated   time.Time  `json:"last_updated" db:"last_updated"`
}

type InventoryWithMedication struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	PharmacyID    uuid.UUID  `json:"pharmacy_id" db:"pharmacy_id"`
	MedicationID  uuid.UUID  `json:"medication_id" db:"medication_id"`
	QuantityOnHand int       `json:"quantity_on_hand" db:"quantity_on_hand"`
	ReorderLevel  int        `json:"reorder_level" db:"reorder_level"`
	UnitCost      *float64   `json:"unit_cost" db:"unit_cost"`
	SellingPrice  *float64   `json:"selling_price" db:"selling_price"`
	ExpiryDate    *time.Time `json:"expiry_date" db:"expiry_date"`
	BatchNumber   *string    `json:"batch_number" db:"batch_number"`
	Supplier      *string    `json:"supplier" db:"supplier"`
	LastUpdated   time.Time  `json:"last_updated" db:"last_updated"`
	// Medication details
	MedicationName string  `json:"medication_name" db:"medication_name"`
	Manufacturer    *string `json:"manufacturer" db:"manufacturer"`
	NDC             string  `json:"ndc" db:"ndc"`
	Category        *string `json:"category" db:"category"`
	MaxStock        *int    `json:"max_stock" db:"max_stock"`
	UnitPrice       *float64 `json:"unit_price" db:"unit_price"`
}

// Custom types for JSON handling
type JSON map[string]interface{}

func (j JSON) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSON)
		return nil
	}
	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, j)
	case string:
		return json.Unmarshal([]byte(v), j)
	}
	return nil
}
