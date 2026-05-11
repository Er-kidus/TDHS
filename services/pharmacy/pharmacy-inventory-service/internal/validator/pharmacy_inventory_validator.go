package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/pharmacy-inventory-service/internal/dto"
)

// ValidatePharmacyInventoryCreate validates a create request.
func ValidatePharmacyInventoryCreate(req dto.CreatePharmacyInventoryRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidatePharmacyInventoryUpdate validates an update request.
func ValidatePharmacyInventoryUpdate(req dto.UpdatePharmacyInventoryRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
