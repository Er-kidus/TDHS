package service

import (
	"context"
	"github.com/tenadam/data-quality-service/internal/dto"
	"github.com/tenadam/data-quality-service/internal/model"
	"github.com/tenadam/data-quality-service/internal/validator"
)

// UpdateDataQuality validates and updates an existing data-quality.
func (s *Service) UpdateDataQuality(ctx context.Context, req dto.UpdateDataQualityRequest) (*dto.DataQualityResponse, error) {
	if err := validator.ValidateDataQualityUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.DataQuality{ID: req.ID}
	updated, err := s.repo.UpdateDataQuality(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DataQualityResponse{ID: updated.ID}, nil
}
