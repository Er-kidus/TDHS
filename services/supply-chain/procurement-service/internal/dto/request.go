package dto

// CreateProcurementRequest holds the fields required to create a procurement.
type CreateProcurementRequest struct {
}

// UpdateProcurementRequest holds the fields that can be updated on a procurement.
type UpdateProcurementRequest struct {
	ID string `json:"id"`
}
