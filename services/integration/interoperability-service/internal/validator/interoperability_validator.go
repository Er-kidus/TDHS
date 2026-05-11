package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/interoperability-service/internal/dto"
)

// ValidateInteroperabilityCreate validates a create request.
func ValidateInteroperabilityCreate(req dto.CreateInteroperabilityRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateInteroperabilityUpdate validates an update request.
func ValidateInteroperabilityUpdate(req dto.UpdateInteroperabilityRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
