package service

import (
	"context"
	"github.com/tenadam/validation-service/internal/dto"
)

// ListValidations retrieves all validations.
func (s *Service) ListValidations(ctx context.Context) (*dto.ListValidationResponse, error) {
	entities, err := s.repo.ListValidations(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ValidationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ValidationResponse{ID: e.ID})
	}
	return &dto.ListValidationResponse{Items: items, Total: len(items)}, nil
}
