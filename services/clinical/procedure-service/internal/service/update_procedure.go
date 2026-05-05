package service

import (
	"context"
	"github.com/tenadam/procedure-service/internal/dto"
	"github.com/tenadam/procedure-service/internal/model"
	"github.com/tenadam/procedure-service/internal/validator"
)

// UpdateProcedure validates and updates an existing procedure.
func (s *Service) UpdateProcedure(ctx context.Context, req dto.UpdateProcedureRequest) (*dto.ProcedureResponse, error) {
	if err := validator.ValidateProcedureUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Procedure{ID: req.ID}
	updated, err := s.repo.UpdateProcedure(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProcedureResponse{ID: updated.ID}, nil
}
