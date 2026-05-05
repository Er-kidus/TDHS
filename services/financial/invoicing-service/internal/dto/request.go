package dto

// CreateInvoicingRequest holds the fields required to create a invoicing.
type CreateInvoicingRequest struct {
}

// UpdateInvoicingRequest holds the fields that can be updated on a invoicing.
type UpdateInvoicingRequest struct {
	ID string `json:"id"`
}
