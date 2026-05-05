package service

import (
	"context"
	"github.com/tenadam/teleconsult-service/internal/dto"
)

// ListTeleconsults retrieves all teleconsults.
func (s *Service) ListTeleconsults(ctx context.Context) (*dto.ListTeleconsultResponse, error) {
	entities, err := s.repo.ListTeleconsults(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.TeleconsultResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.TeleconsultResponse{ID: e.ID})
	}
	return &dto.ListTeleconsultResponse{Items: items, Total: len(items)}, nil
}
