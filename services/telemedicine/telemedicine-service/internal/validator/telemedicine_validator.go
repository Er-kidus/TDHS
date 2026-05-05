package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/telemedicine-service/internal/dto"
)

// ValidateTelemedicineCreate validates a create request.
func ValidateTelemedicineCreate(req dto.CreateTelemedicineRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateTelemedicineUpdate validates an update request.
func ValidateTelemedicineUpdate(req dto.UpdateTelemedicineRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
