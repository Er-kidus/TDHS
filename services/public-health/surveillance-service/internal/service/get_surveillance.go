package service

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/dto"
)

// GetSurveillance retrieves a single surveillance by ID.
func (s *Service) GetSurveillance(ctx context.Context, id string) (*dto.SurveillanceResponse, error) {
	entity, err := s.repo.GetSurveillance(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.SurveillanceResponse{ID: entity.ID}, nil
}
