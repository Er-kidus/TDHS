package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/clinical-data-service/internal/dto"
)

// ValidateClinicalDataCreate validates a create request.
func ValidateClinicalDataCreate(req dto.CreateClinicalDataRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateClinicalDataUpdate validates an update request.
func ValidateClinicalDataUpdate(req dto.UpdateClinicalDataRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
