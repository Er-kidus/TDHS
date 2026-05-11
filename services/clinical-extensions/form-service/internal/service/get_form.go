package service

import (
	"context"
	"github.com/tenadam/form-service/internal/dto"
)

// GetForm retrieves a single form by ID.
func (s *Service) GetForm(ctx context.Context, id string) (*dto.FormResponse, error) {
	entity, err := s.repo.GetForm(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.FormResponse{ID: entity.ID}, nil
}
