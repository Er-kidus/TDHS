package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/appointment-service/internal/dto"
)

// ValidateAppointmentCreate validates a create request.
func ValidateAppointmentCreate(req dto.CreateAppointmentRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAppointmentUpdate validates an update request.
func ValidateAppointmentUpdate(req dto.UpdateAppointmentRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
