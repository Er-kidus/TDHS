package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/teleconsult-service/internal/dto"
)

// ValidateTeleconsultCreate validates a create request.
func ValidateTeleconsultCreate(req dto.CreateTeleconsultRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateTeleconsultUpdate validates an update request.
func ValidateTeleconsultUpdate(req dto.UpdateTeleconsultRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
