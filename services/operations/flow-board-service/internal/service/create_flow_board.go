package service

import (
	"context"
	"github.com/tenadam/flow-board-service/internal/dto"
	"github.com/tenadam/flow-board-service/internal/model"
	"github.com/tenadam/flow-board-service/internal/validator"
)

// CreateFlowBoard validates and creates a new flow-board.
func (s *Service) CreateFlowBoard(ctx context.Context, req dto.CreateFlowBoardRequest) (*dto.FlowBoardResponse, error) {
	if err := validator.ValidateFlowBoardCreate(req); err != nil {
		return nil, err
	}
	entity := &model.FlowBoard{}
	created, err := s.repo.CreateFlowBoard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FlowBoardResponse{ID: created.ID}, nil
}
