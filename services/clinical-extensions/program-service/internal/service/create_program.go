package service

import (
	"context"
	"github.com/tenadam/program-service/internal/dto"
	"github.com/tenadam/program-service/internal/model"
	"github.com/tenadam/program-service/internal/validator"
)

// CreateProgram validates and creates a new program.
func (s *Service) CreateProgram(ctx context.Context, req dto.CreateProgramRequest) (*dto.ProgramResponse, error) {
	if err := validator.ValidateProgramCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Program{}
	created, err := s.repo.CreateProgram(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProgramResponse{ID: created.ID}, nil
}
