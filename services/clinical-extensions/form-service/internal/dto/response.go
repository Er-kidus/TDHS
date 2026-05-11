package dto

// FormResponse is the standard response payload for a single form.
type FormResponse struct {
	ID string `json:"id"`
}

// ListFormResponse is the response payload for a list of forms.
type ListFormResponse struct {
	Items []FormResponse `json:"items"`
	Total int                       `json:"total"`
}
