package service

import (
	"context"
	"github.com/tenadam/identifier-service/internal/dto"
)

// GetIdentifier retrieves a single identifier by ID.
func (s *Service) GetIdentifier(ctx context.Context, id string) (*dto.IdentifierResponse, error) {
	entity, err := s.repo.GetIdentifier(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.IdentifierResponse{ID: entity.ID}, nil
}
