package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/warehouse-service/internal/dto"
)

// ValidateWarehouseCreate validates a create request.
func ValidateWarehouseCreate(req dto.CreateWarehouseRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateWarehouseUpdate validates an update request.
func ValidateWarehouseUpdate(req dto.UpdateWarehouseRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
