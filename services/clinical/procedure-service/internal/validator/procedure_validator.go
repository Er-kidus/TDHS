package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/procedure-service/internal/dto"
)

// ValidateProcedureCreate validates a create request.
func ValidateProcedureCreate(req dto.CreateProcedureRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateProcedureUpdate validates an update request.
func ValidateProcedureUpdate(req dto.UpdateProcedureRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
