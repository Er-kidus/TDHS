package service

import (
	"context"
	"github.com/tenadam/telemedicine-service/internal/dto"
)

// GetTelemedicine retrieves a single telemedicine by ID.
func (s *Service) GetTelemedicine(ctx context.Context, id string) (*dto.TelemedicineResponse, error) {
	entity, err := s.repo.GetTelemedicine(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.TelemedicineResponse{ID: entity.ID}, nil
}
