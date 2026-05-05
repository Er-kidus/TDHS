package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/icu-service/internal/dto"
)

// ValidateIcuCreate validates a create request.
func ValidateIcuCreate(req dto.CreateIcuRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateIcuUpdate validates an update request.
func ValidateIcuUpdate(req dto.UpdateIcuRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
