package service

import (
	"context"
	"github.com/tenadam/terminology-service/internal/dto"
)

// GetTerminology retrieves a single terminology by ID.
func (s *Service) GetTerminology(ctx context.Context, id string) (*dto.TerminologyResponse, error) {
	entity, err := s.repo.GetTerminology(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.TerminologyResponse{ID: entity.ID}, nil
}
