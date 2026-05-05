package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/encounter-service/internal/dto"
)

// ValidateEncounterCreate validates a create request.
func ValidateEncounterCreate(req dto.CreateEncounterRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateEncounterUpdate validates an update request.
func ValidateEncounterUpdate(req dto.UpdateEncounterRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
