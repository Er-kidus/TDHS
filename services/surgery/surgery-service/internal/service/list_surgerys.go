package service

import (
	"context"
	"github.com/tenadam/surgery-service/internal/dto"
)

// ListSurgerys retrieves all surgerys.
func (s *Service) ListSurgerys(ctx context.Context) (*dto.ListSurgeryResponse, error) {
	entities, err := s.repo.ListSurgerys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.SurgeryResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.SurgeryResponse{ID: e.ID})
	}
	return &dto.ListSurgeryResponse{Items: items, Total: len(items)}, nil
}
