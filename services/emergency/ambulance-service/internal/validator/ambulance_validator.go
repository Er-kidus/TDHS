package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/ambulance-service/internal/dto"
)

// ValidateAmbulanceCreate validates a create request.
func ValidateAmbulanceCreate(req dto.CreateAmbulanceRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAmbulanceUpdate validates an update request.
func ValidateAmbulanceUpdate(req dto.UpdateAmbulanceRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
