package service

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/dto"
	"github.com/tenadam/invoicing-service/internal/model"
	"github.com/tenadam/invoicing-service/internal/validator"
)

// UpdateInvoicing validates and updates an existing invoicing.
func (s *Service) UpdateInvoicing(ctx context.Context, req dto.UpdateInvoicingRequest) (*dto.InvoicingResponse, error) {
	if err := validator.ValidateInvoicingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Invoicing{ID: req.ID}
	updated, err := s.repo.UpdateInvoicing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InvoicingResponse{ID: updated.ID}, nil
}
