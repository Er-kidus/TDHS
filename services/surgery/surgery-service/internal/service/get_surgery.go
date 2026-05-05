package service

import (
	"context"
	"github.com/tenadam/surgery-service/internal/dto"
)

// GetSurgery retrieves a single surgery by ID.
func (s *Service) GetSurgery(ctx context.Context, id string) (*dto.SurgeryResponse, error) {
	entity, err := s.repo.GetSurgery(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.SurgeryResponse{ID: entity.ID}, nil
}
