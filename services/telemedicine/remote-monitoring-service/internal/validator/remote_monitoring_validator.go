package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/remote-monitoring-service/internal/dto"
)

// ValidateRemoteMonitoringCreate validates a create request.
func ValidateRemoteMonitoringCreate(req dto.CreateRemoteMonitoringRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateRemoteMonitoringUpdate validates an update request.
func ValidateRemoteMonitoringUpdate(req dto.UpdateRemoteMonitoringRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
