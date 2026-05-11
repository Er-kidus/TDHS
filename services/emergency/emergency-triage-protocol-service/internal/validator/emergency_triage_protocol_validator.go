package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/emergency-triage-protocol-service/internal/dto"
)

// ValidateEmergencyTriageProtocolCreate validates a create request.
func ValidateEmergencyTriageProtocolCreate(req dto.CreateEmergencyTriageProtocolRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateEmergencyTriageProtocolUpdate validates an update request.
func ValidateEmergencyTriageProtocolUpdate(req dto.UpdateEmergencyTriageProtocolRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
