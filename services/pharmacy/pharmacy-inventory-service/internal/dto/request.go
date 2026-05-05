package dto

// CreatePharmacyInventoryRequest holds the fields required to create a pharmacy-inventory.
type CreatePharmacyInventoryRequest struct {
}

// UpdatePharmacyInventoryRequest holds the fields that can be updated on a pharmacy-inventory.
type UpdatePharmacyInventoryRequest struct {
	ID string `json:"id"`
}
