package service

import (
	"context"
	"github.com/tenadam/data-quality-service/internal/dto"
)

// GetDataQuality retrieves a single data-quality by ID.
func (s *Service) GetDataQuality(ctx context.Context, id string) (*dto.DataQualityResponse, error) {
	entity, err := s.repo.GetDataQuality(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.DataQualityResponse{ID: entity.ID}, nil
}
