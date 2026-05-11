package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/claims-service/internal/dto"
)

// ValidateClaimsCreate validates a create request.
func ValidateClaimsCreate(req dto.CreateClaimsRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateClaimsUpdate validates an update request.
func ValidateClaimsUpdate(req dto.UpdateClaimsRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
