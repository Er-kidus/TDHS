package service

import (
	"context"
	"github.com/tenadam/lab-service/internal/dto"
)

// ListLabs retrieves all labs.
func (s *Service) ListLabs(ctx context.Context) (*dto.ListLabResponse, error) {
	entities, err := s.repo.ListLabs(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.LabResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.LabResponse{ID: e.ID})
	}
	return &dto.ListLabResponse{Items: items, Total: len(items)}, nil
}
