package service

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/dto"
)

// GetDispensing retrieves a single dispensing by ID.
func (s *Service) GetDispensing(ctx context.Context, id string) (*dto.DispensingResponse, error) {
	entity, err := s.repo.GetDispensing(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.DispensingResponse{ID: entity.ID}, nil
}
