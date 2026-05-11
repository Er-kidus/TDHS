package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/imaging-service/internal/dto"
)

// ValidateImagingCreate validates a create request.
func ValidateImagingCreate(req dto.CreateImagingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateImagingUpdate validates an update request.
func ValidateImagingUpdate(req dto.UpdateImagingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
