package dto

// CreateMedicationAdministrationRequest holds the fields required to create a medication-administration.
type CreateMedicationAdministrationRequest struct {
}

// UpdateMedicationAdministrationRequest holds the fields that can be updated on a medication-administration.
type UpdateMedicationAdministrationRequest struct {
	ID string `json:"id"`
}
