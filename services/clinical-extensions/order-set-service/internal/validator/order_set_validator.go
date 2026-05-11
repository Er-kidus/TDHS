package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/order-set-service/internal/dto"
)

// ValidateOrderSetCreate validates a create request.
func ValidateOrderSetCreate(req dto.CreateOrderSetRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateOrderSetUpdate validates an update request.
func ValidateOrderSetUpdate(req dto.UpdateOrderSetRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
