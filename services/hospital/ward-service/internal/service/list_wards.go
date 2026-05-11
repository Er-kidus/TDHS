package service

import (
	"context"
	"github.com/tenadam/ward-service/internal/dto"
)

// ListWards retrieves all wards.
func (s *Service) ListWards(ctx context.Context) (*dto.ListWardResponse, error) {
	entities, err := s.repo.ListWards(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.WardResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.WardResponse{ID: e.ID})
	}
	return &dto.ListWardResponse{Items: items, Total: len(items)}, nil
}
