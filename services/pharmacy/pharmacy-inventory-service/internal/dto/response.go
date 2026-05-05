package dto

// PharmacyInventoryResponse is the standard response payload for a single pharmacy-inventory.
type PharmacyInventoryResponse struct {
	ID string `json:"id"`
}

// ListPharmacyInventoryResponse is the response payload for a list of pharmacy-inventorys.
type ListPharmacyInventoryResponse struct {
	Items []PharmacyInventoryResponse `json:"items"`
	Total int                       `json:"total"`
}
