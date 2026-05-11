package service

import (
	"context"
	"github.com/tenadam/specimen-service/internal/dto"
)

// GetSpecimen retrieves a single specimen by ID.
func (s *Service) GetSpecimen(ctx context.Context, id string) (*dto.SpecimenResponse, error) {
	entity, err := s.repo.GetSpecimen(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.SpecimenResponse{ID: entity.ID}, nil
}
