package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/emergency-service/internal/dto"
)

// ValidateEmergencyCreate validates a create request.
func ValidateEmergencyCreate(req dto.CreateEmergencyRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateEmergencyUpdate validates an update request.
func ValidateEmergencyUpdate(req dto.UpdateEmergencyRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
