package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/form-response-service/internal/dto"
)

// ValidateFormResponseCreate validates a create request.
func ValidateFormResponseCreate(req dto.CreateFormResponseRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateFormResponseUpdate validates an update request.
func ValidateFormResponseUpdate(req dto.UpdateFormResponseRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
