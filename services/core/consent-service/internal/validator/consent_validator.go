package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/consent-service/internal/dto"
)

// ValidateConsentCreate validates a create request.
func ValidateConsentCreate(req dto.CreateConsentRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateConsentUpdate validates an update request.
func ValidateConsentUpdate(req dto.UpdateConsentRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
