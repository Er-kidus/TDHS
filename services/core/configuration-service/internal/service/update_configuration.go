package service

import (
	"context"
	"github.com/tenadam/configuration-service/internal/dto"
	"github.com/tenadam/configuration-service/internal/model"
	"github.com/tenadam/configuration-service/internal/validator"
)

// UpdateConfiguration validates and updates an existing configuration.
func (s *Service) UpdateConfiguration(ctx context.Context, req dto.UpdateConfigurationRequest) (*dto.ConfigurationResponse, error) {
	if err := validator.ValidateConfigurationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Configuration{ID: req.ID}
	updated, err := s.repo.UpdateConfiguration(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ConfigurationResponse{ID: updated.ID}, nil
}
