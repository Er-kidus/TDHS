package dto

// CreatePricingRequest holds the fields required to create a pricing.
type CreatePricingRequest struct {
}

// UpdatePricingRequest holds the fields that can be updated on a pricing.
type UpdatePricingRequest struct {
	ID string `json:"id"`
}
