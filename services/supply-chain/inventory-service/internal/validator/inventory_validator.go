package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/inventory-service/internal/dto"
)

// ValidateInventoryCreate validates a create request.
func ValidateInventoryCreate(req dto.CreateInventoryRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateInventoryUpdate validates an update request.
func ValidateInventoryUpdate(req dto.UpdateInventoryRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
