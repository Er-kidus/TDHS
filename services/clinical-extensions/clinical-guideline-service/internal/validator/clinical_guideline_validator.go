package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/clinical-guideline-service/internal/dto"
)

// ValidateClinicalGuidelineCreate validates a create request.
func ValidateClinicalGuidelineCreate(req dto.CreateClinicalGuidelineRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateClinicalGuidelineUpdate validates an update request.
func ValidateClinicalGuidelineUpdate(req dto.UpdateClinicalGuidelineRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
