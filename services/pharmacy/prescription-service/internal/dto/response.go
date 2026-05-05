package dto

// PrescriptionResponse is the standard response payload for a single prescription.
type PrescriptionResponse struct {
	ID string `json:"id"`
}

// ListPrescriptionResponse is the response payload for a list of prescriptions.
type ListPrescriptionResponse struct {
	Items []PrescriptionResponse `json:"items"`
	Total int                       `json:"total"`
}
