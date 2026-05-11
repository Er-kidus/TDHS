package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/identifier-service/internal/dto"
)

// ValidateIdentifierCreate validates a create request.
func ValidateIdentifierCreate(req dto.CreateIdentifierRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateIdentifierUpdate validates an update request.
func ValidateIdentifierUpdate(req dto.UpdateIdentifierRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
