package service

import (
	"context"
	"github.com/tenadam/national-reporting-service/internal/dto"
	"github.com/tenadam/national-reporting-service/internal/model"
	"github.com/tenadam/national-reporting-service/internal/validator"
)

// UpdateNationalReporting validates and updates an existing national-reporting.
func (s *Service) UpdateNationalReporting(ctx context.Context, req dto.UpdateNationalReportingRequest) (*dto.NationalReportingResponse, error) {
	if err := validator.ValidateNationalReportingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.NationalReporting{ID: req.ID}
	updated, err := s.repo.UpdateNationalReporting(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NationalReportingResponse{ID: updated.ID}, nil
}
