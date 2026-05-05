package dto

// TelemedicineResponse is the standard response payload for a single telemedicine.
type TelemedicineResponse struct {
	ID string `json:"id"`
}

// ListTelemedicineResponse is the response payload for a list of telemedicines.
type ListTelemedicineResponse struct {
	Items []TelemedicineResponse `json:"items"`
	Total int                       `json:"total"`
}
