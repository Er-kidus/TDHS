package dto

// LabResponse is the standard response payload for a single lab.
type LabResponse struct {
	ID string `json:"id"`
}

// ListLabResponse is the response payload for a list of labs.
type ListLabResponse struct {
	Items []LabResponse `json:"items"`
	Total int                       `json:"total"`
}
