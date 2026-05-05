package dto

// CreateBillingRequest holds the fields required to create a billing.
type CreateBillingRequest struct {
}

// UpdateBillingRequest holds the fields that can be updated on a billing.
type UpdateBillingRequest struct {
	ID string `json:"id"`
}
