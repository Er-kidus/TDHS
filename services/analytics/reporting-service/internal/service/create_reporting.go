package service

import (
	"context"
	"github.com/tenadam/reporting-service/internal/dto"
	"github.com/tenadam/reporting-service/internal/model"
	"github.com/tenadam/reporting-service/internal/validator"
)

// CreateReporting validates and creates a new reporting.
func (s *Service) CreateReporting(ctx context.Context, req dto.CreateReportingRequest) (*dto.ReportingResponse, error) {
	if err := validator.ValidateReportingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Reporting{}
	created, err := s.repo.CreateReporting(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ReportingResponse{ID: created.ID}, nil
}
