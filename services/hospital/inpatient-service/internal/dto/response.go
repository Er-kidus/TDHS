package dto

// InpatientResponse is the standard response payload for a single inpatient.
type InpatientResponse struct {
	ID string `json:"id"`
}

// ListInpatientResponse is the response payload for a list of inpatients.
type ListInpatientResponse struct {
	Items []InpatientResponse `json:"items"`
	Total int                       `json:"total"`
}
