package dto

// InvoicingResponse is the standard response payload for a single invoicing.
type InvoicingResponse struct {
	ID string `json:"id"`
}

// ListInvoicingResponse is the response payload for a list of invoicings.
type ListInvoicingResponse struct {
	Items []InvoicingResponse `json:"items"`
	Total int                       `json:"total"`
}
