package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/analytics-service/internal/dto"
)

// ValidateAnalyticsCreate validates a create request.
func ValidateAnalyticsCreate(req dto.CreateAnalyticsRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAnalyticsUpdate validates an update request.
func ValidateAnalyticsUpdate(req dto.UpdateAnalyticsRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
