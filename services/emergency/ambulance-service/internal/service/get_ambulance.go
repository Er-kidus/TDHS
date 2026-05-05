package service

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/dto"
)

// GetAmbulance retrieves a single ambulance by ID.
func (s *Service) GetAmbulance(ctx context.Context, id string) (*dto.AmbulanceResponse, error) {
	entity, err := s.repo.GetAmbulance(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AmbulanceResponse{ID: entity.ID}, nil
}
