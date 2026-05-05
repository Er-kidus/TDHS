package service

import (
	"context"
	"github.com/tenadam/lab-service/internal/dto"
)

// GetLab retrieves a single lab by ID.
func (s *Service) GetLab(ctx context.Context, id string) (*dto.LabResponse, error) {
	entity, err := s.repo.GetLab(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.LabResponse{ID: entity.ID}, nil
}
