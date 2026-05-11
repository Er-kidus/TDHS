package service

import (
	"context"
	"github.com/tenadam/reporting-service/internal/dto"
)

// ListReportings retrieves all reportings.
func (s *Service) ListReportings(ctx context.Context) (*dto.ListReportingResponse, error) {
	entities, err := s.repo.ListReportings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ReportingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ReportingResponse{ID: e.ID})
	}
	return &dto.ListReportingResponse{Items: items, Total: len(items)}, nil
}
