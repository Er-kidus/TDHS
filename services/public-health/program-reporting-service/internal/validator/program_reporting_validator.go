package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/program-reporting-service/internal/dto"
)

// ValidateProgramReportingCreate validates a create request.
func ValidateProgramReportingCreate(req dto.CreateProgramReportingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateProgramReportingUpdate validates an update request.
func ValidateProgramReportingUpdate(req dto.UpdateProgramReportingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
