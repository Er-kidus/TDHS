package service

import (
	"context"
	"github.com/tenadam/practitioner-service/internal/dto"
)

// GetPractitioner retrieves a single practitioner by ID.
func (s *Service) GetPractitioner(ctx context.Context, id string) (*dto.PractitionerResponse, error) {
	entity, err := s.repo.GetPractitioner(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PractitionerResponse{ID: entity.ID}, nil
}
