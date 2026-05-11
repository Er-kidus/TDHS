package dto

// EmergencyResponse is the standard response payload for a single emergency.
type EmergencyResponse struct {
	ID string `json:"id"`
}

// ListEmergencyResponse is the response payload for a list of emergencys.
type ListEmergencyResponse struct {
	Items []EmergencyResponse `json:"items"`
	Total int                       `json:"total"`
}
