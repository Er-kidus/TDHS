package service

import (
	"context"
	"github.com/tenadam/bed-management-service/internal/dto"
)

// GetBedManagement retrieves a single bed-management by ID.
func (s *Service) GetBedManagement(ctx context.Context, id string) (*dto.BedManagementResponse, error) {
	entity, err := s.repo.GetBedManagement(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.BedManagementResponse{ID: entity.ID}, nil
}
