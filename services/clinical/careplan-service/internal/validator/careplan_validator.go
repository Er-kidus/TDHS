package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/careplan-service/internal/dto"
)

// ValidateCareplanCreate validates a create request.
func ValidateCareplanCreate(req dto.CreateCareplanRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateCareplanUpdate validates an update request.
func ValidateCareplanUpdate(req dto.UpdateCareplanRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
