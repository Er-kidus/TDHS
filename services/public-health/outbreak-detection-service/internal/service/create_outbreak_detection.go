package service

import (
	"context"
	"github.com/tenadam/outbreak-detection-service/internal/dto"
	"github.com/tenadam/outbreak-detection-service/internal/model"
	"github.com/tenadam/outbreak-detection-service/internal/validator"
)

// CreateOutbreakDetection validates and creates a new outbreak-detection.
func (s *Service) CreateOutbreakDetection(ctx context.Context, req dto.CreateOutbreakDetectionRequest) (*dto.OutbreakDetectionResponse, error) {
	if err := validator.ValidateOutbreakDetectionCreate(req); err != nil {
		return nil, err
	}
	entity := &model.OutbreakDetection{}
	created, err := s.repo.CreateOutbreakDetection(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OutbreakDetectionResponse{ID: created.ID}, nil
}
