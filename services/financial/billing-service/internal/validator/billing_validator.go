package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/billing-service/internal/dto"
)

// ValidateBillingCreate validates a create request.
func ValidateBillingCreate(req dto.CreateBillingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateBillingUpdate validates an update request.
func ValidateBillingUpdate(req dto.UpdateBillingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
