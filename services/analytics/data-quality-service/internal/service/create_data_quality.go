package service

import (
	"context"
	"github.com/tenadam/data-quality-service/internal/dto"
	"github.com/tenadam/data-quality-service/internal/model"
	"github.com/tenadam/data-quality-service/internal/validator"
)

// CreateDataQuality validates and creates a new data-quality.
func (s *Service) CreateDataQuality(ctx context.Context, req dto.CreateDataQualityRequest) (*dto.DataQualityResponse, error) {
	if err := validator.ValidateDataQualityCreate(req); err != nil {
		return nil, err
	}
	entity := &model.DataQuality{}
	created, err := s.repo.CreateDataQuality(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DataQualityResponse{ID: created.ID}, nil
}
