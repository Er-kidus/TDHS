package service

import (
	"context"
	"github.com/tenadam/reporting-service/internal/dto"
)

// GetReporting retrieves a single reporting by ID.
func (s *Service) GetReporting(ctx context.Context, id string) (*dto.ReportingResponse, error) {
	entity, err := s.repo.GetReporting(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ReportingResponse{ID: entity.ID}, nil
}
