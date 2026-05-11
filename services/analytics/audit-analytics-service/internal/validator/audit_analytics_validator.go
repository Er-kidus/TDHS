package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/audit-analytics-service/internal/dto"
)

// ValidateAuditAnalyticsCreate validates a create request.
func ValidateAuditAnalyticsCreate(req dto.CreateAuditAnalyticsRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAuditAnalyticsUpdate validates an update request.
func ValidateAuditAnalyticsUpdate(req dto.UpdateAuditAnalyticsRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
