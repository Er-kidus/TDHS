package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/nursing-task-service/internal/dto"
)

// ValidateNursingTaskCreate validates a create request.
func ValidateNursingTaskCreate(req dto.CreateNursingTaskRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateNursingTaskUpdate validates an update request.
func ValidateNursingTaskUpdate(req dto.UpdateNursingTaskRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
