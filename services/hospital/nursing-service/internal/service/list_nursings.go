package service

import (
	"context"
	"github.com/tenadam/nursing-service/internal/dto"
)

// ListNursings retrieves all nursings.
func (s *Service) ListNursings(ctx context.Context) (*dto.ListNursingResponse, error) {
	entities, err := s.repo.ListNursings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.NursingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.NursingResponse{ID: e.ID})
	}
	return &dto.ListNursingResponse{Items: items, Total: len(items)}, nil
}
