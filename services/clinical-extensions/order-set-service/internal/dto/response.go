package dto

// OrderSetResponse is the standard response payload for a single order-set.
type OrderSetResponse struct {
	ID string `json:"id"`
}

// ListOrderSetResponse is the response payload for a list of order-sets.
type ListOrderSetResponse struct {
	Items []OrderSetResponse `json:"items"`
	Total int                       `json:"total"`
}
