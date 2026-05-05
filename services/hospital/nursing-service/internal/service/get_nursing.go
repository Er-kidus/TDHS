package service

import (
	"context"
	"github.com/tenadam/nursing-service/internal/dto"
)

// GetNursing retrieves a single nursing by ID.
func (s *Service) GetNursing(ctx context.Context, id string) (*dto.NursingResponse, error) {
	entity, err := s.repo.GetNursing(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.NursingResponse{ID: entity.ID}, nil
}
