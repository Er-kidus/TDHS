package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/post-operative-care-service/internal/dto"
)

// ValidatePostOperativeCareCreate validates a create request.
func ValidatePostOperativeCareCreate(req dto.CreatePostOperativeCareRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidatePostOperativeCareUpdate validates an update request.
func ValidatePostOperativeCareUpdate(req dto.UpdatePostOperativeCareRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
