package service

import (
	"context"
	"github.com/tenadam/program-reporting-service/internal/dto"
)

// GetProgramReporting retrieves a single program-reporting by ID.
func (s *Service) GetProgramReporting(ctx context.Context, id string) (*dto.ProgramReportingResponse, error) {
	entity, err := s.repo.GetProgramReporting(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ProgramReportingResponse{ID: entity.ID}, nil
}
