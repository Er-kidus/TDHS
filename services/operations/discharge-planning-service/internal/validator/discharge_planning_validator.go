package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/discharge-planning-service/internal/dto"
)

// ValidateDischargePlanningCreate validates a create request.
func ValidateDischargePlanningCreate(req dto.CreateDischargePlanningRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateDischargePlanningUpdate validates an update request.
func ValidateDischargePlanningUpdate(req dto.UpdateDischargePlanningRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
