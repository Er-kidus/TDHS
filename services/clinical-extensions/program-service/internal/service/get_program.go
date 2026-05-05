package service

import (
	"context"
	"github.com/tenadam/program-service/internal/dto"
)

// GetProgram retrieves a single program by ID.
func (s *Service) GetProgram(ctx context.Context, id string) (*dto.ProgramResponse, error) {
	entity, err := s.repo.GetProgram(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ProgramResponse{ID: entity.ID}, nil
}
