package dto

// AmbulanceResponse is the standard response payload for a single ambulance.
type AmbulanceResponse struct {
	ID string `json:"id"`
}

// ListAmbulanceResponse is the response payload for a list of ambulances.
type ListAmbulanceResponse struct {
	Items []AmbulanceResponse `json:"items"`
	Total int                       `json:"total"`
}
