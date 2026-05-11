package dto

// PaymentResponse is the standard response payload for a single payment.
type PaymentResponse struct {
	ID string `json:"id"`
}

// ListPaymentResponse is the response payload for a list of payments.
type ListPaymentResponse struct {
	Items []PaymentResponse `json:"items"`
	Total int                       `json:"total"`
}
