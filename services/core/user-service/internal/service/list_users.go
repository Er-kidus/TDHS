package service

import (
	"context"
	"github.com/tenadam/user-service/internal/dto"
)

// ListUsers retrieves all users.
func (s *Service) ListUsers(ctx context.Context) (*dto.ListUserResponse, error) {
	entities, err := s.repo.ListUsers(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.UserResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.UserResponse{ID: e.ID})
	}
	return &dto.ListUserResponse{Items: items, Total: len(items)}, nil
}
