package service

import (
	"context"
	"github.com/tenadam/program-service/internal/dto"
)

// ListPrograms retrieves all programs.
func (s *Service) ListPrograms(ctx context.Context) (*dto.ListProgramResponse, error) {
	entities, err := s.repo.ListPrograms(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ProgramResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ProgramResponse{ID: e.ID})
	}
	return &dto.ListProgramResponse{Items: items, Total: len(items)}, nil
}
