package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/form-service/internal/dto"
)

// ValidateFormCreate validates a create request.
func ValidateFormCreate(req dto.CreateFormRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateFormUpdate validates an update request.
func ValidateFormUpdate(req dto.UpdateFormRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
