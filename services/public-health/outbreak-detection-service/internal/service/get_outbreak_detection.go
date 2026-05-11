package service

import (
	"context"
	"github.com/tenadam/outbreak-detection-service/internal/dto"
)

// GetOutbreakDetection retrieves a single outbreak-detection by ID.
func (s *Service) GetOutbreakDetection(ctx context.Context, id string) (*dto.OutbreakDetectionResponse, error) {
	entity, err := s.repo.GetOutbreakDetection(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.OutbreakDetectionResponse{ID: entity.ID}, nil
}
