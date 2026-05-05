package service

import (
	"context"
	"github.com/tenadam/auth-service/internal/dto"
)

// ListAuths retrieves all auths.
func (s *Service) ListAuths(ctx context.Context) (*dto.ListAuthResponse, error) {
	entities, err := s.repo.ListAuths(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AuthResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AuthResponse{ID: e.ID})
	}
	return &dto.ListAuthResponse{Items: items, Total: len(items)}, nil
}
