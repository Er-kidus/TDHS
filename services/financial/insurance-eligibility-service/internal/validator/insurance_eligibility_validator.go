package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/insurance-eligibility-service/internal/dto"
)

// ValidateInsuranceEligibilityCreate validates a create request.
func ValidateInsuranceEligibilityCreate(req dto.CreateInsuranceEligibilityRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateInsuranceEligibilityUpdate validates an update request.
func ValidateInsuranceEligibilityUpdate(req dto.UpdateInsuranceEligibilityRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
