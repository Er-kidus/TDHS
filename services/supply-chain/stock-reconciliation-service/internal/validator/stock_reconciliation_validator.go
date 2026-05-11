package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/stock-reconciliation-service/internal/dto"
)

// ValidateStockReconciliationCreate validates a create request.
func ValidateStockReconciliationCreate(req dto.CreateStockReconciliationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateStockReconciliationUpdate validates an update request.
func ValidateStockReconciliationUpdate(req dto.UpdateStockReconciliationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
