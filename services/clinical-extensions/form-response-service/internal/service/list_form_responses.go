package service

import (
	"context"
	"github.com/tenadam/form-response-service/internal/dto"
)

// ListFormResponses retrieves all form-responses.
func (s *Service) ListFormResponses(ctx context.Context) (*dto.ListFormResponseResponse, error) {
	entities, err := s.repo.ListFormResponses(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.FormResponseResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.FormResponseResponse{ID: e.ID})
	}
	return &dto.ListFormResponseResponse{Items: items, Total: len(items)}, nil
}
