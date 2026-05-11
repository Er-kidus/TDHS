package service

import (
	"context"
	"github.com/tenadam/icu-service/internal/dto"
)

// ListIcus retrieves all icus.
func (s *Service) ListIcus(ctx context.Context) (*dto.ListIcuResponse, error) {
	entities, err := s.repo.ListIcus(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.IcuResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.IcuResponse{ID: e.ID})
	}
	return &dto.ListIcuResponse{Items: items, Total: len(items)}, nil
}
