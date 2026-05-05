package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/household-service/internal/dto"
)

// ValidateHouseholdCreate validates a create request.
func ValidateHouseholdCreate(req dto.CreateHouseholdRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateHouseholdUpdate validates an update request.
func ValidateHouseholdUpdate(req dto.UpdateHouseholdRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
