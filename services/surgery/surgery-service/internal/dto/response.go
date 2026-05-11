package dto

// SurgeryResponse is the standard response payload for a single surgery.
type SurgeryResponse struct {
	ID string `json:"id"`
}

// ListSurgeryResponse is the response payload for a list of surgerys.
type ListSurgeryResponse struct {
	Items []SurgeryResponse `json:"items"`
	Total int                       `json:"total"`
}
