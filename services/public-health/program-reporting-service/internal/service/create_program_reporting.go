package service

import (
	"context"
	"github.com/tenadam/program-reporting-service/internal/dto"
	"github.com/tenadam/program-reporting-service/internal/model"
	"github.com/tenadam/program-reporting-service/internal/validator"
)

// CreateProgramReporting validates and creates a new program-reporting.
func (s *Service) CreateProgramReporting(ctx context.Context, req dto.CreateProgramReportingRequest) (*dto.ProgramReportingResponse, error) {
	if err := validator.ValidateProgramReportingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.ProgramReporting{}
	created, err := s.repo.CreateProgramReporting(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProgramReportingResponse{ID: created.ID}, nil
}
