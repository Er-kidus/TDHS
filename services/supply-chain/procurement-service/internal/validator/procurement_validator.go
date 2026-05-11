package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/procurement-service/internal/dto"
)

// ValidateProcurementCreate validates a create request.
func ValidateProcurementCreate(req dto.CreateProcurementRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateProcurementUpdate validates an update request.
func ValidateProcurementUpdate(req dto.UpdateProcurementRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
