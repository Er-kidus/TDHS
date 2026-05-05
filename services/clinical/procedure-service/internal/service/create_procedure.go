package service

import (
	"context"
	"github.com/tenadam/procedure-service/internal/dto"
	"github.com/tenadam/procedure-service/internal/model"
	"github.com/tenadam/procedure-service/internal/validator"
)

// CreateProcedure validates and creates a new procedure.
func (s *Service) CreateProcedure(ctx context.Context, req dto.CreateProcedureRequest) (*dto.ProcedureResponse, error) {
	if err := validator.ValidateProcedureCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Procedure{}
	created, err := s.repo.CreateProcedure(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProcedureResponse{ID: created.ID}, nil
}
