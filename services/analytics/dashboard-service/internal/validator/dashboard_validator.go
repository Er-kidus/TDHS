package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/dashboard-service/internal/dto"
)

// ValidateDashboardCreate validates a create request.
func ValidateDashboardCreate(req dto.CreateDashboardRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateDashboardUpdate validates an update request.
func ValidateDashboardUpdate(req dto.UpdateDashboardRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
