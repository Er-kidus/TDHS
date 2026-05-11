package service

import (
	"context"
	"github.com/tenadam/consent-service/internal/dto"
)

// GetConsent retrieves a single consent by ID.
func (s *Service) GetConsent(ctx context.Context, id string) (*dto.ConsentResponse, error) {
	entity, err := s.repo.GetConsent(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ConsentResponse{ID: entity.ID}, nil
}
