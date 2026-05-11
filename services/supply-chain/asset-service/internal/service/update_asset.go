package service

import (
	"context"
	"github.com/tenadam/asset-service/internal/dto"
	"github.com/tenadam/asset-service/internal/model"
	"github.com/tenadam/asset-service/internal/validator"
)

// UpdateAsset validates and updates an existing asset.
func (s *Service) UpdateAsset(ctx context.Context, req dto.UpdateAssetRequest) (*dto.AssetResponse, error) {
	if err := validator.ValidateAssetUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Asset{ID: req.ID}
	updated, err := s.repo.UpdateAsset(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AssetResponse{ID: updated.ID}, nil
}
