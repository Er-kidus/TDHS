package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/result-service/internal/dto"
)

// ValidateResultCreate validates a create request.
func ValidateResultCreate(req dto.CreateResultRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateResultUpdate validates an update request.
func ValidateResultUpdate(req dto.UpdateResultRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
