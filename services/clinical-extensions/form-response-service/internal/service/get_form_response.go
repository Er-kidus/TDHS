package service

import (
	"context"
	"github.com/tenadam/form-response-service/internal/dto"
)

// GetFormResponse retrieves a single form-response by ID.
func (s *Service) GetFormResponse(ctx context.Context, id string) (*dto.FormResponseResponse, error) {
	entity, err := s.repo.GetFormResponse(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.FormResponseResponse{ID: entity.ID}, nil
}
