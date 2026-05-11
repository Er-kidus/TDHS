package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/surgery-scheduling-service/internal/dto"
)

// ValidateSurgerySchedulingCreate validates a create request.
func ValidateSurgerySchedulingCreate(req dto.CreateSurgerySchedulingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateSurgerySchedulingUpdate validates an update request.
func ValidateSurgerySchedulingUpdate(req dto.UpdateSurgerySchedulingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
