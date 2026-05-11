package dto

// BillingResponse is the standard response payload for a single billing.
type BillingResponse struct {
	ID string `json:"id"`
}

// ListBillingResponse is the response payload for a list of billings.
type ListBillingResponse struct {
	Items []BillingResponse `json:"items"`
	Total int                       `json:"total"`
}
