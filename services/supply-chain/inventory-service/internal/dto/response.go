package dto

// InventoryResponse is the standard response payload for a single inventory.
type InventoryResponse struct {
	ID string `json:"id"`
}

// ListInventoryResponse is the response payload for a list of inventorys.
type ListInventoryResponse struct {
	Items []InventoryResponse `json:"items"`
	Total int                       `json:"total"`
}
