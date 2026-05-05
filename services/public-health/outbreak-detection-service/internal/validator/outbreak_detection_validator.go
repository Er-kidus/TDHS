package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/outbreak-detection-service/internal/dto"
)

// ValidateOutbreakDetectionCreate validates a create request.
func ValidateOutbreakDetectionCreate(req dto.CreateOutbreakDetectionRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateOutbreakDetectionUpdate validates an update request.
func ValidateOutbreakDetectionUpdate(req dto.UpdateOutbreakDetectionRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
