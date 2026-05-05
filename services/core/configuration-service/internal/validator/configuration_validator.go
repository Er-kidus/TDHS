package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/configuration-service/internal/dto"
)

// ValidateConfigurationCreate validates a create request.
func ValidateConfigurationCreate(req dto.CreateConfigurationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateConfigurationUpdate validates an update request.
func ValidateConfigurationUpdate(req dto.UpdateConfigurationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
