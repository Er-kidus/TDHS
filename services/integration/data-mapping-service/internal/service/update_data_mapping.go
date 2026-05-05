package service

import (
	"context"
	"github.com/tenadam/data-mapping-service/internal/dto"
	"github.com/tenadam/data-mapping-service/internal/model"
	"github.com/tenadam/data-mapping-service/internal/validator"
)

// UpdateDataMapping validates and updates an existing data-mapping.
func (s *Service) UpdateDataMapping(ctx context.Context, req dto.UpdateDataMappingRequest) (*dto.DataMappingResponse, error) {
	if err := validator.ValidateDataMappingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.DataMapping{ID: req.ID}
	updated, err := s.repo.UpdateDataMapping(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DataMappingResponse{ID: updated.ID}, nil
}
