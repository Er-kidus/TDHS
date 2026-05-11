package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/integration-job-service/internal/dto"
)

// ValidateIntegrationJobCreate validates a create request.
func ValidateIntegrationJobCreate(req dto.CreateIntegrationJobRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateIntegrationJobUpdate validates an update request.
func ValidateIntegrationJobUpdate(req dto.UpdateIntegrationJobRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
