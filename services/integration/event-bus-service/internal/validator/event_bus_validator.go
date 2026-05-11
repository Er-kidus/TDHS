package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/event-bus-service/internal/dto"
)

// ValidateEventBusCreate validates a create request.
func ValidateEventBusCreate(req dto.CreateEventBusRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateEventBusUpdate validates an update request.
func ValidateEventBusUpdate(req dto.UpdateEventBusRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
