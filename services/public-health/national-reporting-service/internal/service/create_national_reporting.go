package service

import (
	"context"
	"github.com/tenadam/national-reporting-service/internal/dto"
	"github.com/tenadam/national-reporting-service/internal/model"
	"github.com/tenadam/national-reporting-service/internal/validator"
)

// CreateNationalReporting validates and creates a new national-reporting.
func (s *Service) CreateNationalReporting(ctx context.Context, req dto.CreateNationalReportingRequest) (*dto.NationalReportingResponse, error) {
	if err := validator.ValidateNationalReportingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.NationalReporting{}
	created, err := s.repo.CreateNationalReporting(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NationalReportingResponse{ID: created.ID}, nil
}
