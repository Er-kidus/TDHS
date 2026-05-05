package dto

// PricingResponse is the standard response payload for a single pricing.
type PricingResponse struct {
	ID string `json:"id"`
}

// ListPricingResponse is the response payload for a list of pricings.
type ListPricingResponse struct {
	Items []PricingResponse `json:"items"`
	Total int                       `json:"total"`
}
