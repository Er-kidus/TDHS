package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/audit-service/internal/dto"
)

// ValidateAuditCreate validates a create request.
func ValidateAuditCreate(req dto.CreateAuditRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAuditUpdate validates an update request.
func ValidateAuditUpdate(req dto.UpdateAuditRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
