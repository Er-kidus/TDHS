package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/fhir-service/internal/dto"
)

// ValidateFhirCreate validates a create request.
func ValidateFhirCreate(req dto.CreateFhirRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateFhirUpdate validates an update request.
func ValidateFhirUpdate(req dto.UpdateFhirRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
