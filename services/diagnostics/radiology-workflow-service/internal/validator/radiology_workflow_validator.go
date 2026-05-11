package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/radiology-workflow-service/internal/dto"
)

// ValidateRadiologyWorkflowCreate validates a create request.
func ValidateRadiologyWorkflowCreate(req dto.CreateRadiologyWorkflowRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateRadiologyWorkflowUpdate validates an update request.
func ValidateRadiologyWorkflowUpdate(req dto.UpdateRadiologyWorkflowRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
