package dto

// NursingResponse is the standard response payload for a single nursing.
type NursingResponse struct {
	ID string `json:"id"`
}

// ListNursingResponse is the response payload for a list of nursings.
type ListNursingResponse struct {
	Items []NursingResponse `json:"items"`
	Total int                       `json:"total"`
}
