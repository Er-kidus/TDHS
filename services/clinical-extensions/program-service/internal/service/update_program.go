package service

import (
	"context"
	"github.com/tenadam/program-service/internal/dto"
	"github.com/tenadam/program-service/internal/model"
	"github.com/tenadam/program-service/internal/validator"
)

// UpdateProgram validates and updates an existing program.
func (s *Service) UpdateProgram(ctx context.Context, req dto.UpdateProgramRequest) (*dto.ProgramResponse, error) {
	if err := validator.ValidateProgramUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Program{ID: req.ID}
	updated, err := s.repo.UpdateProgram(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProgramResponse{ID: updated.ID}, nil
}
