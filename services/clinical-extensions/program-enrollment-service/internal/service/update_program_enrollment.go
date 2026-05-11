package service

import (
	"context"
	"github.com/tenadam/program-enrollment-service/internal/dto"
	"github.com/tenadam/program-enrollment-service/internal/model"
	"github.com/tenadam/program-enrollment-service/internal/validator"
)

// UpdateProgramEnrollment validates and updates an existing program-enrollment.
func (s *Service) UpdateProgramEnrollment(ctx context.Context, req dto.UpdateProgramEnrollmentRequest) (*dto.ProgramEnrollmentResponse, error) {
	if err := validator.ValidateProgramEnrollmentUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.ProgramEnrollment{ID: req.ID}
	updated, err := s.repo.UpdateProgramEnrollment(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProgramEnrollmentResponse{ID: updated.ID}, nil
}
