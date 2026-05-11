package dto

// ProcurementResponse is the standard response payload for a single procurement.
type ProcurementResponse struct {
	ID string `json:"id"`
}

// ListProcurementResponse is the response payload for a list of procurements.
type ListProcurementResponse struct {
	Items []ProcurementResponse `json:"items"`
	Total int                       `json:"total"`
}
