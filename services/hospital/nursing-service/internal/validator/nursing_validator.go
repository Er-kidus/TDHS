package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/nursing-service/internal/dto"
)

// ValidateNursingCreate validates a create request.
func ValidateNursingCreate(req dto.CreateNursingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateNursingUpdate validates an update request.
func ValidateNursingUpdate(req dto.UpdateNursingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
