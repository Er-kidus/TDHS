package dto

// CreateMedicationRequest holds the fields required to create a medication.
type CreateMedicationRequest struct {
}

// UpdateMedicationRequest holds the fields that can be updated on a medication.
type UpdateMedicationRequest struct {
	ID string `json:"id"`
}
