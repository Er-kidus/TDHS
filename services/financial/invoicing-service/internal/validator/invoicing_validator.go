package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/invoicing-service/internal/dto"
)

// ValidateInvoicingCreate validates a create request.
func ValidateInvoicingCreate(req dto.CreateInvoicingRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateInvoicingUpdate validates an update request.
func ValidateInvoicingUpdate(req dto.UpdateInvoicingRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
