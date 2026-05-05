package service

import (
	"context"
	"github.com/tenadam/claims-service/internal/dto"
)

// GetClaims retrieves a single claims by ID.
func (s *Service) GetClaims(ctx context.Context, id string) (*dto.ClaimsResponse, error) {
	entity, err := s.repo.GetClaims(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ClaimsResponse{ID: entity.ID}, nil
}
