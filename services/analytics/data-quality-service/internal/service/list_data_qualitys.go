package service

import (
	"context"
	"github.com/tenadam/data-quality-service/internal/dto"
)

// ListDataQualitys retrieves all data-qualitys.
func (s *Service) ListDataQualitys(ctx context.Context) (*dto.ListDataQualityResponse, error) {
	entities, err := s.repo.ListDataQualitys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.DataQualityResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.DataQualityResponse{ID: e.ID})
	}
	return &dto.ListDataQualityResponse{Items: items, Total: len(items)}, nil
}
