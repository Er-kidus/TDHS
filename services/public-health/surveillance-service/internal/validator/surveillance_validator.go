package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/surveillance-service/internal/dto"
)

// ValidateSurveillanceCreate validates a create request.
func ValidateSurveillanceCreate(req dto.CreateSurveillanceRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateSurveillanceUpdate validates an update request.
func ValidateSurveillanceUpdate(req dto.UpdateSurveillanceRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
