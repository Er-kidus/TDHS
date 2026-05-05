package service

import (
	"context"
	"github.com/tenadam/data-mapping-service/internal/dto"
)

// GetDataMapping retrieves a single data-mapping by ID.
func (s *Service) GetDataMapping(ctx context.Context, id string) (*dto.DataMappingResponse, error) {
	entity, err := s.repo.GetDataMapping(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.DataMappingResponse{ID: entity.ID}, nil
}
