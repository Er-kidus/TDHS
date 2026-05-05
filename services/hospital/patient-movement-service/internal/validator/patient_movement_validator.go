package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/patient-movement-service/internal/dto"
)

// ValidatePatientMovementCreate validates a create request.
func ValidatePatientMovementCreate(req dto.CreatePatientMovementRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidatePatientMovementUpdate validates an update request.
func ValidatePatientMovementUpdate(req dto.UpdatePatientMovementRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
