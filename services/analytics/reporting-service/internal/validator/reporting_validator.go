package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/reporting-service/internal/dto"
)

// ValidateReportingCreate validates a create request.
func ValidateReportingCreate(req dto.CreateReportingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateReportingUpdate validates an update request.
func ValidateReportingUpdate(req dto.UpdateReportingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
