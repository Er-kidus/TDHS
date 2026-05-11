package service

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/dto"
)

// ListInpatients retrieves all inpatients.
func (s *Service) ListInpatients(ctx context.Context) (*dto.ListInpatientResponse, error) {
	entities, err := s.repo.ListInpatients(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.InpatientResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.InpatientResponse{ID: e.ID})
	}
	return &dto.ListInpatientResponse{Items: items, Total: len(items)}, nil
}
