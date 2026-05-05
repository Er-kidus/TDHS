package service

import (
	"context"
	"github.com/tenadam/procedure-service/internal/dto"
)

// ListProcedures retrieves all procedures.
func (s *Service) ListProcedures(ctx context.Context) (*dto.ListProcedureResponse, error) {
	entities, err := s.repo.ListProcedures(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ProcedureResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ProcedureResponse{ID: e.ID})
	}
	return &dto.ListProcedureResponse{Items: items, Total: len(items)}, nil
}
