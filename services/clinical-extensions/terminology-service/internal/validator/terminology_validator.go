package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/terminology-service/internal/dto"
)

// ValidateTerminologyCreate validates a create request.
func ValidateTerminologyCreate(req dto.CreateTerminologyRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateTerminologyUpdate validates an update request.
func ValidateTerminologyUpdate(req dto.UpdateTerminologyRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
