package dto

// CreateStockReconciliationRequest holds the fields required to create a stock-reconciliation.
type CreateStockReconciliationRequest struct {
}

// UpdateStockReconciliationRequest holds the fields that can be updated on a stock-reconciliation.
type UpdateStockReconciliationRequest struct {
	ID string `json:"id"`
}
