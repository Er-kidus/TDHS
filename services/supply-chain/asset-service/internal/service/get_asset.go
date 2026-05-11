package service

import (
	"context"
	"github.com/tenadam/asset-service/internal/dto"
)

// GetAsset retrieves a single asset by ID.
func (s *Service) GetAsset(ctx context.Context, id string) (*dto.AssetResponse, error) {
	entity, err := s.repo.GetAsset(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AssetResponse{ID: entity.ID}, nil
}
