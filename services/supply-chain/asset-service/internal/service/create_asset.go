package service

import (
	"context"
	"github.com/tenadam/asset-service/internal/dto"
	"github.com/tenadam/asset-service/internal/model"
	"github.com/tenadam/asset-service/internal/validator"
)

// CreateAsset validates and creates a new asset.
func (s *Service) CreateAsset(ctx context.Context, req dto.CreateAssetRequest) (*dto.AssetResponse, error) {
	if err := validator.ValidateAssetCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Asset{}
	created, err := s.repo.CreateAsset(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AssetResponse{ID: created.ID}, nil
}
