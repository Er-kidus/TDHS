package dto

// CreateInventoryRequest holds the fields required to create a inventory.
type CreateInventoryRequest struct {
}

// UpdateInventoryRequest holds the fields that can be updated on a inventory.
type UpdateInventoryRequest struct {
	ID string `json:"id"`
}
