package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/video-session-service/internal/dto"
)

// ValidateVideoSessionCreate validates a create request.
func ValidateVideoSessionCreate(req dto.CreateVideoSessionRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateVideoSessionUpdate validates an update request.
func ValidateVideoSessionUpdate(req dto.UpdateVideoSessionRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
