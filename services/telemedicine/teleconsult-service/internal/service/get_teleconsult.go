package service

import (
	"context"
	"github.com/tenadam/teleconsult-service/internal/dto"
)

// GetTeleconsult retrieves a single teleconsult by ID.
func (s *Service) GetTeleconsult(ctx context.Context, id string) (*dto.TeleconsultResponse, error) {
	entity, err := s.repo.GetTeleconsult(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.TeleconsultResponse{ID: entity.ID}, nil
}
