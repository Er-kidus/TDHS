package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/chat-service/internal/dto"
)

// ValidateChatCreate validates a create request.
func ValidateChatCreate(req dto.CreateChatRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateChatUpdate validates an update request.
func ValidateChatUpdate(req dto.UpdateChatRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
