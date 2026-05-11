package dto

// HouseholdResponse is the standard response payload for a single household.
type HouseholdResponse struct {
	ID string `json:"id"`
}

// ListHouseholdResponse is the response payload for a list of households.
type ListHouseholdResponse struct {
	Items []HouseholdResponse `json:"items"`
	Total int                       `json:"total"`
}
