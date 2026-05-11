package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/nursing-dashboard-service/internal/dto"
)

// ValidateNursingDashboardCreate validates a create request.
func ValidateNursingDashboardCreate(req dto.CreateNursingDashboardRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateNursingDashboardUpdate validates an update request.
func ValidateNursingDashboardUpdate(req dto.UpdateNursingDashboardRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
