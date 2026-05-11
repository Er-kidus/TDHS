package dto

// IcuResponse is the standard response payload for a single icu.
type IcuResponse struct {
	ID string `json:"id"`
}

// ListIcuResponse is the response payload for a list of icus.
type ListIcuResponse struct {
	Items []IcuResponse `json:"items"`
	Total int                       `json:"total"`
}
