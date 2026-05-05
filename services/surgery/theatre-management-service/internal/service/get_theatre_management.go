package service

import (
	"context"
	"github.com/tenadam/theatre-management-service/internal/dto"
)

// GetTheatreManagement retrieves a single theatre-management by ID.
func (s *Service) GetTheatreManagement(ctx context.Context, id string) (*dto.TheatreManagementResponse, error) {
	entity, err := s.repo.GetTheatreManagement(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.TheatreManagementResponse{ID: entity.ID}, nil
}
