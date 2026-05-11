package dto

// ValidationResponse is the standard response payload for a single validation.
type ValidationResponse struct {
	ID string `json:"id"`
}

// ListValidationResponse is the response payload for a list of validations.
type ListValidationResponse struct {
	Items []ValidationResponse `json:"items"`
	Total int                       `json:"total"`
}
