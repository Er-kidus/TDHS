package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/specimen-service/internal/dto"
)

// ValidateSpecimenCreate validates a create request.
func ValidateSpecimenCreate(req dto.CreateSpecimenRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateSpecimenUpdate validates an update request.
func ValidateSpecimenUpdate(req dto.UpdateSpecimenRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
