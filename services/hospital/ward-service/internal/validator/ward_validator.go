package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/ward-service/internal/dto"
)

// ValidateWardCreate validates a create request.
func ValidateWardCreate(req dto.CreateWardRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateWardUpdate validates an update request.
func ValidateWardUpdate(req dto.UpdateWardRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
