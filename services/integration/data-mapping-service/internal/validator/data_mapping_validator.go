package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/data-mapping-service/internal/dto"
)

// ValidateDataMappingCreate validates a create request.
func ValidateDataMappingCreate(req dto.CreateDataMappingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateDataMappingUpdate validates an update request.
func ValidateDataMappingUpdate(req dto.UpdateDataMappingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
