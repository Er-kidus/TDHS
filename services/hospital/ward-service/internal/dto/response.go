package dto

// WardResponse is the standard response payload for a single ward.
type WardResponse struct {
	ID string `json:"id"`
}

// ListWardResponse is the response payload for a list of wards.
type ListWardResponse struct {
	Items []WardResponse `json:"items"`
	Total int                       `json:"total"`
}
