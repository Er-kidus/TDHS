package dto

// CreateWarehouseRequest holds the fields required to create a warehouse.
type CreateWarehouseRequest struct {
}

// UpdateWarehouseRequest holds the fields that can be updated on a warehouse.
type UpdateWarehouseRequest struct {
	ID string `json:"id"`
}
