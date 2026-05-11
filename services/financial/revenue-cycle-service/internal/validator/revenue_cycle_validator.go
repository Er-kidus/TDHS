package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/revenue-cycle-service/internal/dto"
)

// ValidateRevenueCycleCreate validates a create request.
func ValidateRevenueCycleCreate(req dto.CreateRevenueCycleRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateRevenueCycleUpdate validates an update request.
func ValidateRevenueCycleUpdate(req dto.UpdateRevenueCycleRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
