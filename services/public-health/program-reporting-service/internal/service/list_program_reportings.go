package service

import (
	"context"
	"github.com/tenadam/program-reporting-service/internal/dto"
)

// ListProgramReportings retrieves all program-reportings.
func (s *Service) ListProgramReportings(ctx context.Context) (*dto.ListProgramReportingResponse, error) {
	entities, err := s.repo.ListProgramReportings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ProgramReportingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ProgramReportingResponse{ID: e.ID})
	}
	return &dto.ListProgramReportingResponse{Items: items, Total: len(items)}, nil
}
