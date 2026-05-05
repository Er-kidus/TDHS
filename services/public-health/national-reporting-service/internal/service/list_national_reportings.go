package service

import (
	"context"
	"github.com/tenadam/national-reporting-service/internal/dto"
)

// ListNationalReportings retrieves all national-reportings.
func (s *Service) ListNationalReportings(ctx context.Context) (*dto.ListNationalReportingResponse, error) {
	entities, err := s.repo.ListNationalReportings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.NationalReportingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.NationalReportingResponse{ID: e.ID})
	}
	return &dto.ListNationalReportingResponse{Items: items, Total: len(items)}, nil
}
