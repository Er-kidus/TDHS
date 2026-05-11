package model

import "time"

// StockReconciliation represents a stock-reconciliation entity.
type StockReconciliation struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
