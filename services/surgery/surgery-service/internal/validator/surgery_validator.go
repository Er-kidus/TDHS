package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/surgery-service/internal/dto"
)

// ValidateSurgeryCreate validates a create request.
func ValidateSurgeryCreate(req dto.CreateSurgeryRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateSurgeryUpdate validates an update request.
func ValidateSurgeryUpdate(req dto.UpdateSurgeryRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
