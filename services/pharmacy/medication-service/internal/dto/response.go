package dto

// MedicationResponse is the standard response payload for a single medication.
type MedicationResponse struct {
	ID string `json:"id"`
}

// ListMedicationResponse is the response payload for a list of medications.
type ListMedicationResponse struct {
	Items []MedicationResponse `json:"items"`
	Total int                       `json:"total"`
}
