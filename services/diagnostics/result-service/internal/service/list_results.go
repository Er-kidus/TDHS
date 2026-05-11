package service

import (
	"context"
	"github.com/tenadam/result-service/internal/dto"
)

// ListResults retrieves all results.
func (s *Service) ListResults(ctx context.Context) (*dto.ListResultResponse, error) {
	entities, err := s.repo.ListResults(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ResultResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ResultResponse{ID: e.ID})
	}
	return &dto.ListResultResponse{Items: items, Total: len(items)}, nil
}
