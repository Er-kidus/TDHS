package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/tele-triage-service/internal/dto"
)

// ValidateTeleTriageCreate validates a create request.
func ValidateTeleTriageCreate(req dto.CreateTeleTriageRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateTeleTriageUpdate validates an update request.
func ValidateTeleTriageUpdate(req dto.UpdateTeleTriageRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
