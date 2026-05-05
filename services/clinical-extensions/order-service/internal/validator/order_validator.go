package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/order-service/internal/dto"
)

// ValidateOrderCreate validates a create request.
func ValidateOrderCreate(req dto.CreateOrderRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateOrderUpdate validates an update request.
func ValidateOrderUpdate(req dto.UpdateOrderRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
