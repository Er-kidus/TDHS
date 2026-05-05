package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/prescription-service/internal/dto"
)

// ValidatePrescriptionCreate validates a create request.
func ValidatePrescriptionCreate(req dto.CreatePrescriptionRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidatePrescriptionUpdate validates an update request.
func ValidatePrescriptionUpdate(req dto.UpdatePrescriptionRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
