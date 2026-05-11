package dto

// CreatePaymentRequest holds the fields required to create a payment.
type CreatePaymentRequest struct {
}

// UpdatePaymentRequest holds the fields that can be updated on a payment.
type UpdatePaymentRequest struct {
	ID string `json:"id"`
}
