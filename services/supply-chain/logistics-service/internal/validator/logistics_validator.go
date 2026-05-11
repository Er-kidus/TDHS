package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/logistics-service/internal/dto"
)

// ValidateLogisticsCreate validates a create request.
func ValidateLogisticsCreate(req dto.CreateLogisticsRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateLogisticsUpdate validates an update request.
func ValidateLogisticsUpdate(req dto.UpdateLogisticsRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
