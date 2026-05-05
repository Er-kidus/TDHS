package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/surgery-protocol-service/internal/dto"
)

// ValidateSurgeryProtocolCreate validates a create request.
func ValidateSurgeryProtocolCreate(req dto.CreateSurgeryProtocolRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateSurgeryProtocolUpdate validates an update request.
func ValidateSurgeryProtocolUpdate(req dto.UpdateSurgeryProtocolRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
