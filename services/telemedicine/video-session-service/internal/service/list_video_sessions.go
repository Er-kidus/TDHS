package service

import (
	"context"
	"github.com/tenadam/video-session-service/internal/dto"
)

// ListVideoSessions retrieves all video-sessions.
func (s *Service) ListVideoSessions(ctx context.Context) (*dto.ListVideoSessionResponse, error) {
	entities, err := s.repo.ListVideoSessions(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.VideoSessionResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.VideoSessionResponse{ID: e.ID})
	}
	return &dto.ListVideoSessionResponse{Items: items, Total: len(items)}, nil
}
