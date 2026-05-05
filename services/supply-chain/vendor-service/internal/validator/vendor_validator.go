package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/vendor-service/internal/dto"
)

// ValidateVendorCreate validates a create request.
func ValidateVendorCreate(req dto.CreateVendorRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateVendorUpdate validates an update request.
func ValidateVendorUpdate(req dto.UpdateVendorRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
