package service

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/dto"
)

// GetInvoicing retrieves a single invoicing by ID.
func (s *Service) GetInvoicing(ctx context.Context, id string) (*dto.InvoicingResponse, error) {
	entity, err := s.repo.GetInvoicing(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.InvoicingResponse{ID: entity.ID}, nil
}
