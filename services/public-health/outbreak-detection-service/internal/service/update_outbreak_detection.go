package service

import (
	"context"
	"github.com/tenadam/outbreak-detection-service/internal/dto"
	"github.com/tenadam/outbreak-detection-service/internal/model"
	"github.com/tenadam/outbreak-detection-service/internal/validator"
)

// UpdateOutbreakDetection validates and updates an existing outbreak-detection.
func (s *Service) UpdateOutbreakDetection(ctx context.Context, req dto.UpdateOutbreakDetectionRequest) (*dto.OutbreakDetectionResponse, error) {
	if err := validator.ValidateOutbreakDetectionUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.OutbreakDetection{ID: req.ID}
	updated, err := s.repo.UpdateOutbreakDetection(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OutbreakDetectionResponse{ID: updated.ID}, nil
}
