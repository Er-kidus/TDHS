package service

import (
	"context"
	"github.com/tenadam/video-session-service/internal/dto"
)

// GetVideoSession retrieves a single video-session by ID.
func (s *Service) GetVideoSession(ctx context.Context, id string) (*dto.VideoSessionResponse, error) {
	entity, err := s.repo.GetVideoSession(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.VideoSessionResponse{ID: entity.ID}, nil
}
