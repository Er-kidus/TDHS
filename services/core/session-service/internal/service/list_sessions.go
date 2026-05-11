package service

import (
	"context"
	"github.com/tenadam/session-service/internal/dto"
)

// ListSessions retrieves all sessions.
func (s *Service) ListSessions(ctx context.Context) (*dto.ListSessionResponse, error) {
	entities, err := s.repo.ListSessions(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.SessionResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.SessionResponse{ID: e.ID})
	}
	return &dto.ListSessionResponse{Items: items, Total: len(items)}, nil
}
