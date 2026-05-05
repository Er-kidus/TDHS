package service

import (
	"context"
	"github.com/tenadam/logistics-service/internal/dto"
)

// ListLogisticss retrieves all logisticss.
func (s *Service) ListLogisticss(ctx context.Context) (*dto.ListLogisticsResponse, error) {
	entities, err := s.repo.ListLogisticss(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.LogisticsResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.LogisticsResponse{ID: e.ID})
	}
	return &dto.ListLogisticsResponse{Items: items, Total: len(items)}, nil
}
