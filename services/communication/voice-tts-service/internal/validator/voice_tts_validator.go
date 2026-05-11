package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/voice-tts-service/internal/dto"
)

// ValidateVoiceTtsCreate validates a create request.
func ValidateVoiceTtsCreate(req dto.CreateVoiceTtsRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateVoiceTtsUpdate validates an update request.
func ValidateVoiceTtsUpdate(req dto.UpdateVoiceTtsRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
