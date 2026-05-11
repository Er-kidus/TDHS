package service

import (
	"context"
	"github.com/tenadam/asset-service/internal/dto"
)

// ListAssets retrieves all assets.
func (s *Service) ListAssets(ctx context.Context) (*dto.ListAssetResponse, error) {
	entities, err := s.repo.ListAssets(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AssetResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AssetResponse{ID: e.ID})
	}
	return &dto.ListAssetResponse{Items: items, Total: len(items)}, nil
}
