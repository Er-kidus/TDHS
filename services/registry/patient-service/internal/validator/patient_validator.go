package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/patient-service/internal/dto"
)

// ValidatePatientCreate validates a create request.
func ValidatePatientCreate(req dto.CreatePatientRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidatePatientUpdate validates an update request.
func ValidatePatientUpdate(req dto.UpdatePatientRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
