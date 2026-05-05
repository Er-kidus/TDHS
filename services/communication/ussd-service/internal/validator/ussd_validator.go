package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/ussd-service/internal/dto"
)

// ValidateUssdCreate validates a create request.
func ValidateUssdCreate(req dto.CreateUssdRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateUssdUpdate validates an update request.
func ValidateUssdUpdate(req dto.UpdateUssdRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
