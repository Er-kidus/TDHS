package dto

// PatientResponse is the standard response payload for a single patient.
type PatientResponse struct {
	ID string `json:"id"`
}

// ListPatientResponse is the response payload for a list of patients.
type ListPatientResponse struct {
	Items []PatientResponse `json:"items"`
	Total int                       `json:"total"`
}
