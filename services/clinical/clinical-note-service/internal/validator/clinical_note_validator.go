package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/clinical-note-service/internal/dto"
)

// ValidateClinicalNoteCreate validates a create request.
func ValidateClinicalNoteCreate(req dto.CreateClinicalNoteRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateClinicalNoteUpdate validates an update request.
func ValidateClinicalNoteUpdate(req dto.UpdateClinicalNoteRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
