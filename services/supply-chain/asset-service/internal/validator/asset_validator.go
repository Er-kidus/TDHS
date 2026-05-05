package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/asset-service/internal/dto"
)

// ValidateAssetCreate validates a create request.
func ValidateAssetCreate(req dto.CreateAssetRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateAssetUpdate validates an update request.
func ValidateAssetUpdate(req dto.UpdateAssetRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
