package service

import (
	"context"
	"github.com/tenadam/configuration-service/internal/dto"
)

// GetConfiguration retrieves a single configuration by ID.
func (s *Service) GetConfiguration(ctx context.Context, id string) (*dto.ConfigurationResponse, error) {
	entity, err := s.repo.GetConfiguration(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ConfigurationResponse{ID: entity.ID}, nil
}
