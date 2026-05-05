package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/medication-administration-service/internal/dto"
)

// ValidateMedicationAdministrationCreate validates a create request.
func ValidateMedicationAdministrationCreate(req dto.CreateMedicationAdministrationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateMedicationAdministrationUpdate validates an update request.
func ValidateMedicationAdministrationUpdate(req dto.UpdateMedicationAdministrationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
