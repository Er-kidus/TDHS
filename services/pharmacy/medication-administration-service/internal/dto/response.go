package dto

// MedicationAdministrationResponse is the standard response payload for a single medication-administration.
type MedicationAdministrationResponse struct {
	ID string `json:"id"`
}

// ListMedicationAdministrationResponse is the response payload for a list of medication-administrations.
type ListMedicationAdministrationResponse struct {
	Items []MedicationAdministrationResponse `json:"items"`
	Total int                       `json:"total"`
}
