package dto

// PatientMovementResponse is the standard response payload for a single patient-movement.
type PatientMovementResponse struct {
	ID string `json:"id"`
}

// ListPatientMovementResponse is the response payload for a list of patient-movements.
type ListPatientMovementResponse struct {
	Items []PatientMovementResponse `json:"items"`
	Total int                       `json:"total"`
}
