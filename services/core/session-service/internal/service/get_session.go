package service

import (
	"context"
	"github.com/tenadam/session-service/internal/dto"
)

// GetSession retrieves a single session by ID.
func (s *Service) GetSession(ctx context.Context, id string) (*dto.SessionResponse, error) {
	entity, err := s.repo.GetSession(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.SessionResponse{ID: entity.ID}, nil
}
