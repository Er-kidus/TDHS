package service

import (
	"context"
	"github.com/tenadam/auth-service/internal/dto"
)

// GetAuth retrieves a single auth by ID.
func (s *Service) GetAuth(ctx context.Context, id string) (*dto.AuthResponse, error) {
	entity, err := s.repo.GetAuth(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AuthResponse{ID: entity.ID}, nil
}
