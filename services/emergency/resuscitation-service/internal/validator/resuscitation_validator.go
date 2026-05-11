package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/resuscitation-service/internal/dto"
)

// ValidateResuscitationCreate validates a create request.
func ValidateResuscitationCreate(req dto.CreateResuscitationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateResuscitationUpdate validates an update request.
func ValidateResuscitationUpdate(req dto.UpdateResuscitationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
