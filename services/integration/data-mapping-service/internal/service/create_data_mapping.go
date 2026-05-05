package service

import (
	"context"
	"github.com/tenadam/data-mapping-service/internal/dto"
	"github.com/tenadam/data-mapping-service/internal/model"
	"github.com/tenadam/data-mapping-service/internal/validator"
)

// CreateDataMapping validates and creates a new data-mapping.
func (s *Service) CreateDataMapping(ctx context.Context, req dto.CreateDataMappingRequest) (*dto.DataMappingResponse, error) {
	if err := validator.ValidateDataMappingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.DataMapping{}
	created, err := s.repo.CreateDataMapping(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DataMappingResponse{ID: created.ID}, nil
}
