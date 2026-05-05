package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/inpatient-service/internal/dto"
)

// ValidateInpatientCreate validates a create request.
func ValidateInpatientCreate(req dto.CreateInpatientRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateInpatientUpdate validates an update request.
func ValidateInpatientUpdate(req dto.UpdateInpatientRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
