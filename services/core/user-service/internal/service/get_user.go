package service

import (
	"context"
	"github.com/tenadam/user-service/internal/dto"
)

// GetUser retrieves a single user by ID.
func (s *Service) GetUser(ctx context.Context, id string) (*dto.UserResponse, error) {
	entity, err := s.repo.GetUser(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.UserResponse{ID: entity.ID}, nil
}
