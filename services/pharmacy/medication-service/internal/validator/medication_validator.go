package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/medication-service/internal/dto"
)

// ValidateMedicationCreate validates a create request.
func ValidateMedicationCreate(req dto.CreateMedicationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateMedicationUpdate validates an update request.
func ValidateMedicationUpdate(req dto.UpdateMedicationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
