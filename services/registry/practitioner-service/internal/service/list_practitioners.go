package service

import (
	"context"
	"github.com/tenadam/practitioner-service/internal/dto"
)

// ListPractitioners retrieves all practitioners.
func (s *Service) ListPractitioners(ctx context.Context) (*dto.ListPractitionerResponse, error) {
	entities, err := s.repo.ListPractitioners(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PractitionerResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PractitionerResponse{ID: e.ID})
	}
	return &dto.ListPractitionerResponse{Items: items, Total: len(items)}, nil
}
