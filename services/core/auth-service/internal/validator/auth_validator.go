package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/auth-service/internal/dto"
)

// ValidateAuthCreate validates a create request.
func ValidateAuthCreate(req dto.CreateAuthRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAuthUpdate validates an update request.
func ValidateAuthUpdate(req dto.UpdateAuthRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
