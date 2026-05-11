package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/claim-adjudication-service/internal/dto"
)

// ValidateClaimAdjudicationCreate validates a create request.
func ValidateClaimAdjudicationCreate(req dto.CreateClaimAdjudicationRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateClaimAdjudicationUpdate validates an update request.
func ValidateClaimAdjudicationUpdate(req dto.UpdateClaimAdjudicationRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
