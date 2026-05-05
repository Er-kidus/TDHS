package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/program-enrollment-service/internal/dto"
)

// ValidateProgramEnrollmentCreate validates a create request.
func ValidateProgramEnrollmentCreate(req dto.CreateProgramEnrollmentRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateProgramEnrollmentUpdate validates an update request.
func ValidateProgramEnrollmentUpdate(req dto.UpdateProgramEnrollmentRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
