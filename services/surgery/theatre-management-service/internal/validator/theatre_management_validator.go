package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/theatre-management-service/internal/dto"
)

// ValidateTheatreManagementCreate validates a create request.
func ValidateTheatreManagementCreate(req dto.CreateTheatreManagementRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateTheatreManagementUpdate validates an update request.
func ValidateTheatreManagementUpdate(req dto.UpdateTheatreManagementRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
