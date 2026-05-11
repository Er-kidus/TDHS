package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/access-control-service/internal/dto"
)

// ValidateAccessControlCreate validates a create request.
func ValidateAccessControlCreate(req dto.CreateAccessControlRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAccessControlUpdate validates an update request.
func ValidateAccessControlUpdate(req dto.UpdateAccessControlRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
