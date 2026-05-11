package service

import (
	"context"
	"github.com/tenadam/ussd-service/internal/dto"
)

// ListUssds retrieves all ussds.
func (s *Service) ListUssds(ctx context.Context) (*dto.ListUssdResponse, error) {
	entities, err := s.repo.ListUssds(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.UssdResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.UssdResponse{ID: e.ID})
	}
	return &dto.ListUssdResponse{Items: items, Total: len(items)}, nil
}
