package service

import (
	"context"
	"github.com/tenadam/reporting-service/internal/dto"
	"github.com/tenadam/reporting-service/internal/model"
	"github.com/tenadam/reporting-service/internal/validator"
)

// UpdateReporting validates and updates an existing reporting.
func (s *Service) UpdateReporting(ctx context.Context, req dto.UpdateReportingRequest) (*dto.ReportingResponse, error) {
	if err := validator.ValidateReportingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Reporting{ID: req.ID}
	updated, err := s.repo.UpdateReporting(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ReportingResponse{ID: updated.ID}, nil
}
