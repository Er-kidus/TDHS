package service

import (
	"context"
	"github.com/tenadam/national-reporting-service/internal/dto"
)

// GetNationalReporting retrieves a single national-reporting by ID.
func (s *Service) GetNationalReporting(ctx context.Context, id string) (*dto.NationalReportingResponse, error) {
	entity, err := s.repo.GetNationalReporting(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.NationalReportingResponse{ID: entity.ID}, nil
}
