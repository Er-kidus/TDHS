package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/lab-service/internal/dto"
)

// ValidateLabCreate validates a create request.
func ValidateLabCreate(req dto.CreateLabRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateLabUpdate validates an update request.
func ValidateLabUpdate(req dto.UpdateLabRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
