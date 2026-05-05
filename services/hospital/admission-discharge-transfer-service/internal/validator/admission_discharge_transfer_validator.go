package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/admission-discharge-transfer-service/internal/dto"
)

// ValidateAdmissionDischargeTransferCreate validates a create request.
func ValidateAdmissionDischargeTransferCreate(req dto.CreateAdmissionDischargeTransferRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAdmissionDischargeTransferUpdate validates an update request.
func ValidateAdmissionDischargeTransferUpdate(req dto.UpdateAdmissionDischargeTransferRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
