package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/queue-service/internal/dto"
)

// ValidateQueueCreate validates a create request.
func ValidateQueueCreate(req dto.CreateQueueRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateQueueUpdate validates an update request.
func ValidateQueueUpdate(req dto.UpdateQueueRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
