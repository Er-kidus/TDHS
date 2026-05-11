package service

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/dto"
)

// ListDispensings retrieves all dispensings.
func (s *Service) ListDispensings(ctx context.Context) (*dto.ListDispensingResponse, error) {
	entities, err := s.repo.ListDispensings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.DispensingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.DispensingResponse{ID: e.ID})
	}
	return &dto.ListDispensingResponse{Items: items, Total: len(items)}, nil
}
