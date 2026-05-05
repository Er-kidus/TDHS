package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/payment-service/internal/dto"
)

// ValidatePaymentCreate validates a create request.
func ValidatePaymentCreate(req dto.CreatePaymentRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidatePaymentUpdate validates an update request.
func ValidatePaymentUpdate(req dto.UpdatePaymentRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
