package service

import (
	"context"
	"github.com/tenadam/configuration-service/internal/dto"
	"github.com/tenadam/configuration-service/internal/model"
	"github.com/tenadam/configuration-service/internal/validator"
)

// CreateConfiguration validates and creates a new configuration.
func (s *Service) CreateConfiguration(ctx context.Context, req dto.CreateConfigurationRequest) (*dto.ConfigurationResponse, error) {
	if err := validator.ValidateConfigurationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Configuration{}
	created, err := s.repo.CreateConfiguration(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ConfigurationResponse{ID: created.ID}, nil
}
