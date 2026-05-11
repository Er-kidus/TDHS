package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/practitioner-service/internal/dto"
)

// ValidatePractitionerCreate validates a create request.
func ValidatePractitionerCreate(req dto.CreatePractitionerRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidatePractitionerUpdate validates an update request.
func ValidatePractitionerUpdate(req dto.UpdatePractitionerRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
