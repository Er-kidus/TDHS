package service

import (
	"context"
	"github.com/tenadam/emergency-service/internal/dto"
)

// GetEmergency retrieves a single emergency by ID.
func (s *Service) GetEmergency(ctx context.Context, id string) (*dto.EmergencyResponse, error) {
	entity, err := s.repo.GetEmergency(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.EmergencyResponse{ID: entity.ID}, nil
}
