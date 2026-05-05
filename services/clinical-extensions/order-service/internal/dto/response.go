package dto

// OrderResponse is the standard response payload for a single order.
type OrderResponse struct {
	ID string `json:"id"`
}

// ListOrderResponse is the response payload for a list of orders.
type ListOrderResponse struct {
	Items []OrderResponse `json:"items"`
	Total int                       `json:"total"`
}
