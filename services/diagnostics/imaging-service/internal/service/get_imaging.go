package service

import (
	"context"
	"github.com/tenadam/imaging-service/internal/dto"
)

// GetImaging retrieves a single imaging by ID.
func (s *Service) GetImaging(ctx context.Context, id string) (*dto.ImagingResponse, error) {
	entity, err := s.repo.GetImaging(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ImagingResponse{ID: entity.ID}, nil
}
