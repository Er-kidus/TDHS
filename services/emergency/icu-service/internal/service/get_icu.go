package service

import (
	"context"
	"github.com/tenadam/icu-service/internal/dto"
)

// GetIcu retrieves a single icu by ID.
func (s *Service) GetIcu(ctx context.Context, id string) (*dto.IcuResponse, error) {
	entity, err := s.repo.GetIcu(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.IcuResponse{ID: entity.ID}, nil
}
