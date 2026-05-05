package service

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/dto"
)

// ListInvoicings retrieves all invoicings.
func (s *Service) ListInvoicings(ctx context.Context) (*dto.ListInvoicingResponse, error) {
	entities, err := s.repo.ListInvoicings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.InvoicingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.InvoicingResponse{ID: e.ID})
	}
	return &dto.ListInvoicingResponse{Items: items, Total: len(items)}, nil
}
