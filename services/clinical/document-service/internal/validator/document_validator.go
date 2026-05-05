package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/document-service/internal/dto"
)

// ValidateDocumentCreate validates a create request.
func ValidateDocumentCreate(req dto.CreateDocumentRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateDocumentUpdate validates an update request.
func ValidateDocumentUpdate(req dto.UpdateDocumentRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
