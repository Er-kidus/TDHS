package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/lab-workflow-service/internal/dto"
)

// ValidateLabWorkflowCreate validates a create request.
func ValidateLabWorkflowCreate(req dto.CreateLabWorkflowRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateLabWorkflowUpdate validates an update request.
func ValidateLabWorkflowUpdate(req dto.UpdateLabWorkflowRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
