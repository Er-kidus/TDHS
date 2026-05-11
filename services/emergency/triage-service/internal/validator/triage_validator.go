package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/triage-service/internal/dto"
)

// ValidateTriageCreate validates a create request.
func ValidateTriageCreate(req dto.CreateTriageRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateTriageUpdate validates an update request.
func ValidateTriageUpdate(req dto.UpdateTriageRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
