package dto

// FacilityResponse is the standard response payload for a single facility.
type FacilityResponse struct {
	ID string `json:"id"`
}

// ListFacilityResponse is the response payload for a list of facilitys.
type ListFacilityResponse struct {
	Items []FacilityResponse `json:"items"`
	Total int                       `json:"total"`
}
