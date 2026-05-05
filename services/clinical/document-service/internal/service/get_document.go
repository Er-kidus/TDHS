package service

import (
	"context"
	"github.com/tenadam/document-service/internal/dto"
)

// GetDocument retrieves a single document by ID.
func (s *Service) GetDocument(ctx context.Context, id string) (*dto.DocumentResponse, error) {
	entity, err := s.repo.GetDocument(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.DocumentResponse{ID: entity.ID}, nil
}
