package service

import (
	"context"
	"github.com/tenadam/terminology-service/internal/dto"
)

// ListTerminologys retrieves all terminologys.
func (s *Service) ListTerminologys(ctx context.Context) (*dto.ListTerminologyResponse, error) {
	entities, err := s.repo.ListTerminologys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.TerminologyResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.TerminologyResponse{ID: e.ID})
	}
	return &dto.ListTerminologyResponse{Items: items, Total: len(items)}, nil
}
