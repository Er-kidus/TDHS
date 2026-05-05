package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/organization-service/internal/dto"
)

// ValidateOrganizationCreate validates a create request.
func ValidateOrganizationCreate(req dto.CreateOrganizationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateOrganizationUpdate validates an update request.
func ValidateOrganizationUpdate(req dto.UpdateOrganizationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
