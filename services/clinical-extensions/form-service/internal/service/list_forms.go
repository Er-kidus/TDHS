package service

import (
	"context"
	"github.com/tenadam/form-service/internal/dto"
)

// ListForms retrieves all forms.
func (s *Service) ListForms(ctx context.Context) (*dto.ListFormResponse, error) {
	entities, err := s.repo.ListForms(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.FormResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.FormResponse{ID: e.ID})
	}
	return &dto.ListFormResponse{Items: items, Total: len(items)}, nil
}
