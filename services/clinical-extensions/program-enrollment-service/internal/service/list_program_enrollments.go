package service

import (
	"context"
	"github.com/tenadam/program-enrollment-service/internal/dto"
)

// ListProgramEnrollments retrieves all program-enrollments.
func (s *Service) ListProgramEnrollments(ctx context.Context) (*dto.ListProgramEnrollmentResponse, error) {
	entities, err := s.repo.ListProgramEnrollments(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ProgramEnrollmentResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ProgramEnrollmentResponse{ID: e.ID})
	}
	return &dto.ListProgramEnrollmentResponse{Items: items, Total: len(items)}, nil
}
