package service

import (
	"context"
	"github.com/tenadam/procedure-service/internal/dto"
)

// GetProcedure retrieves a single procedure by ID.
func (s *Service) GetProcedure(ctx context.Context, id string) (*dto.ProcedureResponse, error) {
	entity, err := s.repo.GetProcedure(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ProcedureResponse{ID: entity.ID}, nil
}
