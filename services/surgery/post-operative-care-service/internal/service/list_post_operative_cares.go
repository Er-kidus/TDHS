package service

import (
	"context"
	"github.com/tenadam/post-operative-care-service/internal/dto"
)

// ListPostOperativeCares retrieves all post-operative-cares.
func (s *Service) ListPostOperativeCares(ctx context.Context) (*dto.ListPostOperativeCareResponse, error) {
	entities, err := s.repo.ListPostOperativeCares(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PostOperativeCareResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PostOperativeCareResponse{ID: e.ID})
	}
	return &dto.ListPostOperativeCareResponse{Items: items, Total: len(items)}, nil
}
