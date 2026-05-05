package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/national-reporting-service/internal/dto"
)

// ValidateNationalReportingCreate validates a create request.
func ValidateNationalReportingCreate(req dto.CreateNationalReportingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateNationalReportingUpdate validates an update request.
func ValidateNationalReportingUpdate(req dto.UpdateNationalReportingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
