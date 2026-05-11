package service

import (
	"context"
	"github.com/tenadam/resuscitation-service/internal/dto"
)

// ListResuscitations retrieves all resuscitations.
func (s *Service) ListResuscitations(ctx context.Context) (*dto.ListResuscitationResponse, error) {
	entities, err := s.repo.ListResuscitations(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ResuscitationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ResuscitationResponse{ID: e.ID})
	}
	return &dto.ListResuscitationResponse{Items: items, Total: len(items)}, nil
}
