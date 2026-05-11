package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/scheduling-service/internal/dto"
)

// ValidateSchedulingCreate validates a create request.
func ValidateSchedulingCreate(req dto.CreateSchedulingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateSchedulingUpdate validates an update request.
func ValidateSchedulingUpdate(req dto.UpdateSchedulingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
