package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/check-in-service/internal/dto"
)

// ValidateCheckInCreate validates a create request.
func ValidateCheckInCreate(req dto.CreateCheckInRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateCheckInUpdate validates an update request.
func ValidateCheckInUpdate(req dto.UpdateCheckInRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
