package model

import "time"

type Medication struct {
	Base
	Name        string `json:"name"`
	GenericName string `json:"generic_name,omitempty"`
	RxNormCode  string `json:"rx_norm_code,omitempty"`
	DosageForm  string `json:"dosage_form,omitempty"`
	Strength    string `json:"strength,omitempty"`
	IsActive    bool   `json:"is_active"`
}

type PharmacyInventory struct {
	Base
	OrganizationID string      `json:"organization_id"`
	MedicationID   string      `json:"medication_id"`
	StockLevel     int         `json:"stock_level"`
	ReorderLevel   int         `json:"reorder_level"`
	UnitPrice      float64     `json:"unit_price"`
	Status         string      `json:"status"`
	LastRestocked  *time.Time  `json:"last_restocked,omitempty"`
	Medication     *Medication `json:"medication,omitempty"`
}

type PrescriptionFulfillment struct {
	Base
	OrganizationID    string      `json:"organization_id"`
	PatientID         string      `json:"patient_id"`
	PrescriptionID    string      `json:"prescription_id"`
	PharmacistID      string      `json:"pharmacist_id"`
	MedicationID      string      `json:"medication_id"`
	QuantityDispensed int         `json:"quantity_dispensed"`
	Notes             string      `json:"notes,omitempty"`
	FulfilledAt       time.Time   `json:"fulfilled_at"`
	Medication        *Medication `json:"medication,omitempty"`
	Patient           *User       `json:"patient,omitempty"`
	Pharmacist        *User       `json:"pharmacist,omitempty"`
}
