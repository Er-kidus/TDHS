package service

import (
	"context"
	"github.com/tenadam/validation-service/internal/dto"
)

// GetValidation retrieves a single validation by ID.
func (s *Service) GetValidation(ctx context.Context, id string) (*dto.ValidationResponse, error) {
	entity, err := s.repo.GetValidation(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ValidationResponse{ID: entity.ID}, nil
}
