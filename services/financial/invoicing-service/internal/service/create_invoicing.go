package service

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/dto"
	"github.com/tenadam/invoicing-service/internal/model"
	"github.com/tenadam/invoicing-service/internal/validator"
)

// CreateInvoicing validates and creates a new invoicing.
func (s *Service) CreateInvoicing(ctx context.Context, req dto.CreateInvoicingRequest) (*dto.InvoicingResponse, error) {
	if err := validator.ValidateInvoicingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Invoicing{}
	created, err := s.repo.CreateInvoicing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InvoicingResponse{ID: created.ID}, nil
}
