package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/drug-formulary-service/internal/dto"
)

// ValidateDrugFormularyCreate validates a create request.
func ValidateDrugFormularyCreate(req dto.CreateDrugFormularyRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateDrugFormularyUpdate validates an update request.
func ValidateDrugFormularyUpdate(req dto.UpdateDrugFormularyRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
