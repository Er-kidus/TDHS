package dto

// StockReconciliationResponse is the standard response payload for a single stock-reconciliation.
type StockReconciliationResponse struct {
	ID string `json:"id"`
}

// ListStockReconciliationResponse is the response payload for a list of stock-reconciliations.
type ListStockReconciliationResponse struct {
	Items []StockReconciliationResponse `json:"items"`
	Total int                       `json:"total"`
}
