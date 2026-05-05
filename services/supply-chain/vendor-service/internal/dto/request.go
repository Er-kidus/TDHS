package dto

// CreateVendorRequest holds the fields required to create a vendor.
type CreateVendorRequest struct {
}

// UpdateVendorRequest holds the fields that can be updated on a vendor.
type UpdateVendorRequest struct {
	ID string `json:"id"`
}
