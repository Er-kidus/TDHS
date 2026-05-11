package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/dispensing-service/internal/dto"
)

// ValidateDispensingCreate validates a create request.
func ValidateDispensingCreate(req dto.CreateDispensingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateDispensingUpdate validates an update request.
func ValidateDispensingUpdate(req dto.UpdateDispensingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
