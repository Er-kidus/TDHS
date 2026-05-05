package dto

// VendorResponse is the standard response payload for a single vendor.
type VendorResponse struct {
	ID string `json:"id"`
}

// ListVendorResponse is the response payload for a list of vendors.
type ListVendorResponse struct {
	Items []VendorResponse `json:"items"`
	Total int                       `json:"total"`
}
