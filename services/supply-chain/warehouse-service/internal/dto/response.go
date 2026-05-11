package dto

// WarehouseResponse is the standard response payload for a single warehouse.
type WarehouseResponse struct {
	ID string `json:"id"`
}

// ListWarehouseResponse is the response payload for a list of warehouses.
type ListWarehouseResponse struct {
	Items []WarehouseResponse `json:"items"`
	Total int                       `json:"total"`
}
