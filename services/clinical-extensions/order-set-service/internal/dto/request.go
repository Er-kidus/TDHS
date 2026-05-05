package dto

// CreateOrderSetRequest holds the fields required to create a order-set.
type CreateOrderSetRequest struct {
}

// UpdateOrderSetRequest holds the fields that can be updated on a order-set.
type UpdateOrderSetRequest struct {
	ID string `json:"id"`
}
