package dto

// CreateOrderRequest holds the fields required to create a order.
type CreateOrderRequest struct {
}

// UpdateOrderRequest holds the fields that can be updated on a order.
type UpdateOrderRequest struct {
	ID string `json:"id"`
}
