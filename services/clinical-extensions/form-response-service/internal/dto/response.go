package dto

// FormResponseResponse is the standard response payload for a single form-response.
type FormResponseResponse struct {
	ID string `json:"id"`
}

// ListFormResponseResponse is the response payload for a list of form-responses.
type ListFormResponseResponse struct {
	Items []FormResponseResponse `json:"items"`
	Total int                       `json:"total"`
}
