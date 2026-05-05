package service

import (
	"context"
	"github.com/tenadam/program-reporting-service/internal/dto"
	"github.com/tenadam/program-reporting-service/internal/model"
	"github.com/tenadam/program-reporting-service/internal/validator"
)

// UpdateProgramReporting validates and updates an existing program-reporting.
func (s *Service) UpdateProgramReporting(ctx context.Context, req dto.UpdateProgramReportingRequest) (*dto.ProgramReportingResponse, error) {
	if err := validator.ValidateProgramReportingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.ProgramReporting{ID: req.ID}
	updated, err := s.repo.UpdateProgramReporting(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProgramReportingResponse{ID: updated.ID}, nil
}
