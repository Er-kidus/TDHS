package service

import (
	"context"
	"github.com/tenadam/program-enrollment-service/internal/dto"
	"github.com/tenadam/program-enrollment-service/internal/model"
	"github.com/tenadam/program-enrollment-service/internal/validator"
)

// CreateProgramEnrollment validates and creates a new program-enrollment.
func (s *Service) CreateProgramEnrollment(ctx context.Context, req dto.CreateProgramEnrollmentRequest) (*dto.ProgramEnrollmentResponse, error) {
	if err := validator.ValidateProgramEnrollmentCreate(req); err != nil {
		return nil, err
	}
	entity := &model.ProgramEnrollment{}
	created, err := s.repo.CreateProgramEnrollment(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProgramEnrollmentResponse{ID: created.ID}, nil
}
