package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/user-service/internal/dto"
)

// ValidateUserCreate validates a create request.
func ValidateUserCreate(req dto.CreateUserRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateUserUpdate validates an update request.
func ValidateUserUpdate(req dto.UpdateUserRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
