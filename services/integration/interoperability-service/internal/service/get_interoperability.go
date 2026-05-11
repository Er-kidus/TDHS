package service

import (
	"context"
	"github.com/tenadam/interoperability-service/internal/dto"
)

// GetInteroperability retrieves a single interoperability by ID.
func (s *Service) GetInteroperability(ctx context.Context, id string) (*dto.InteroperabilityResponse, error) {
	entity, err := s.repo.GetInteroperability(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.InteroperabilityResponse{ID: entity.ID}, nil
}
