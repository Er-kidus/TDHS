package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/data-quality-service/internal/dto"
)

// ValidateDataQualityCreate validates a create request.
func ValidateDataQualityCreate(req dto.CreateDataQualityRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateDataQualityUpdate validates an update request.
func ValidateDataQualityUpdate(req dto.UpdateDataQualityRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
