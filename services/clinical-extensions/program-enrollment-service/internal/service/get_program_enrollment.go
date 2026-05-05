package service

import (
	"context"
	"github.com/tenadam/program-enrollment-service/internal/dto"
)

// GetProgramEnrollment retrieves a single program-enrollment by ID.
func (s *Service) GetProgramEnrollment(ctx context.Context, id string) (*dto.ProgramEnrollmentResponse, error) {
	entity, err := s.repo.GetProgramEnrollment(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ProgramEnrollmentResponse{ID: entity.ID}, nil
}
