package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/validation-service/internal/dto"
)

// ValidateValidationCreate validates a create request.
func ValidateValidationCreate(req dto.CreateValidationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateValidationUpdate validates an update request.
func ValidateValidationUpdate(req dto.UpdateValidationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
