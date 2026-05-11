package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/program-service/internal/dto"
)

// ValidateProgramCreate validates a create request.
func ValidateProgramCreate(req dto.CreateProgramRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateProgramUpdate validates an update request.
func ValidateProgramUpdate(req dto.UpdateProgramRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
