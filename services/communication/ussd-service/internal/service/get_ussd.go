package service

import (
	"context"
	"github.com/tenadam/ussd-service/internal/dto"
)

// GetUssd retrieves a single ussd by ID.
func (s *Service) GetUssd(ctx context.Context, id string) (*dto.UssdResponse, error) {
	entity, err := s.repo.GetUssd(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.UssdResponse{ID: entity.ID}, nil
}
