package service

import (
	"context"
	"github.com/tenadam/vendor-service/internal/dto"
)

// ListVendors retrieves all vendors.
func (s *Service) ListVendors(ctx context.Context) (*dto.ListVendorResponse, error) {
	entities, err := s.repo.ListVendors(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.VendorResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.VendorResponse{ID: e.ID})
	}
	return &dto.ListVendorResponse{Items: items, Total: len(items)}, nil
}
