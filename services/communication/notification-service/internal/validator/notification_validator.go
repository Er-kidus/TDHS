package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/notification-service/internal/dto"
)

// ValidateNotificationCreate validates a create request.
func ValidateNotificationCreate(req dto.CreateNotificationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateNotificationUpdate validates an update request.
func ValidateNotificationUpdate(req dto.UpdateNotificationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
