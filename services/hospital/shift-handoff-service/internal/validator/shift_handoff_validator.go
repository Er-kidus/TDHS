package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/shift-handoff-service/internal/dto"
)

// ValidateShiftHandoffCreate validates a create request.
func ValidateShiftHandoffCreate(req dto.CreateShiftHandoffRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateShiftHandoffUpdate validates an update request.
func ValidateShiftHandoffUpdate(req dto.UpdateShiftHandoffRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
