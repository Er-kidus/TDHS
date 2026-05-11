package service

import (
	"context"
	"github.com/tenadam/theatre-management-service/internal/dto"
)

// ListTheatreManagements retrieves all theatre-managements.
func (s *Service) ListTheatreManagements(ctx context.Context) (*dto.ListTheatreManagementResponse, error) {
	entities, err := s.repo.ListTheatreManagements(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.TheatreManagementResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.TheatreManagementResponse{ID: e.ID})
	}
	return &dto.ListTheatreManagementResponse{Items: items, Total: len(items)}, nil
}
