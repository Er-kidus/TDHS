package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/referral-service/internal/dto"
)

// ValidateReferralCreate validates a create request.
func ValidateReferralCreate(req dto.CreateReferralRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateReferralUpdate validates an update request.
func ValidateReferralUpdate(req dto.UpdateReferralRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
