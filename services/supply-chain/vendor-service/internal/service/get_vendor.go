package service

import (
	"context"
	"github.com/tenadam/vendor-service/internal/dto"
)

// GetVendor retrieves a single vendor by ID.
func (s *Service) GetVendor(ctx context.Context, id string) (*dto.VendorResponse, error) {
	entity, err := s.repo.GetVendor(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.VendorResponse{ID: entity.ID}, nil
}
