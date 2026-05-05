package service

import (
	"context"
	"github.com/tenadam/configuration-service/internal/dto"
)

// ListConfigurations retrieves all configurations.
func (s *Service) ListConfigurations(ctx context.Context) (*dto.ListConfigurationResponse, error) {
	entities, err := s.repo.ListConfigurations(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ConfigurationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ConfigurationResponse{ID: e.ID})
	}
	return &dto.ListConfigurationResponse{Items: items, Total: len(items)}, nil
}
