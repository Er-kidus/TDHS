package service

import (
	"context"
	"github.com/tenadam/flow-board-service/internal/dto"
	"github.com/tenadam/flow-board-service/internal/model"
	"github.com/tenadam/flow-board-service/internal/validator"
)

// UpdateFlowBoard validates and updates an existing flow-board.
func (s *Service) UpdateFlowBoard(ctx context.Context, req dto.UpdateFlowBoardRequest) (*dto.FlowBoardResponse, error) {
	if err := validator.ValidateFlowBoardUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.FlowBoard{ID: req.ID}
	updated, err := s.repo.UpdateFlowBoard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FlowBoardResponse{ID: updated.ID}, nil
}
