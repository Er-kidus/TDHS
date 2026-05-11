package service

import (
	"context"
	"github.com/tenadam/outbreak-detection-service/internal/dto"
)

// ListOutbreakDetections retrieves all outbreak-detections.
func (s *Service) ListOutbreakDetections(ctx context.Context) (*dto.ListOutbreakDetectionResponse, error) {
	entities, err := s.repo.ListOutbreakDetections(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.OutbreakDetectionResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.OutbreakDetectionResponse{ID: e.ID})
	}
	return &dto.ListOutbreakDetectionResponse{Items: items, Total: len(items)}, nil
}
