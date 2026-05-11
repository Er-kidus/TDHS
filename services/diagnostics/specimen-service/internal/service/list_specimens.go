package service

import (
	"context"
	"github.com/tenadam/specimen-service/internal/dto"
)

// ListSpecimens retrieves all specimens.
func (s *Service) ListSpecimens(ctx context.Context) (*dto.ListSpecimenResponse, error) {
	entities, err := s.repo.ListSpecimens(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.SpecimenResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.SpecimenResponse{ID: e.ID})
	}
	return &dto.ListSpecimenResponse{Items: items, Total: len(items)}, nil
}
