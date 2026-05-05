package service

import (
	"context"
	"github.com/tenadam/data-mapping-service/internal/dto"
)

// ListDataMappings retrieves all data-mappings.
func (s *Service) ListDataMappings(ctx context.Context) (*dto.ListDataMappingResponse, error) {
	entities, err := s.repo.ListDataMappings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.DataMappingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.DataMappingResponse{ID: e.ID})
	}
	return &dto.ListDataMappingResponse{Items: items, Total: len(items)}, nil
}
