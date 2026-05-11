package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/bed-management-service/internal/dto"
)

// ValidateBedManagementCreate validates a create request.
func ValidateBedManagementCreate(req dto.CreateBedManagementRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateBedManagementUpdate validates an update request.
func ValidateBedManagementUpdate(req dto.UpdateBedManagementRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
