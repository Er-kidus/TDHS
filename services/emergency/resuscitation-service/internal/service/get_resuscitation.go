package service

import (
	"context"
	"github.com/tenadam/resuscitation-service/internal/dto"
)

// GetResuscitation retrieves a single resuscitation by ID.
func (s *Service) GetResuscitation(ctx context.Context, id string) (*dto.ResuscitationResponse, error) {
	entity, err := s.repo.GetResuscitation(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ResuscitationResponse{ID: entity.ID}, nil
}
