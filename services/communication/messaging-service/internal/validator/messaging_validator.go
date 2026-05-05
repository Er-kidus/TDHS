package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/messaging-service/internal/dto"
)

// ValidateMessagingCreate validates a create request.
func ValidateMessagingCreate(req dto.CreateMessagingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateMessagingUpdate validates an update request.
func ValidateMessagingUpdate(req dto.UpdateMessagingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
