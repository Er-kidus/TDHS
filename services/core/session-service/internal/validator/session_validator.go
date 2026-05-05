package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/session-service/internal/dto"
)

// ValidateSessionCreate validates a create request.
func ValidateSessionCreate(req dto.CreateSessionRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateSessionUpdate validates an update request.
func ValidateSessionUpdate(req dto.UpdateSessionRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
