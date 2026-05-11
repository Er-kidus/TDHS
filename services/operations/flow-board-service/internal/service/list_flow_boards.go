package service

import (
	"context"
	"github.com/tenadam/flow-board-service/internal/dto"
)

// ListFlowBoards retrieves all flow-boards.
func (s *Service) ListFlowBoards(ctx context.Context) (*dto.ListFlowBoardResponse, error) {
	entities, err := s.repo.ListFlowBoards(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.FlowBoardResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.FlowBoardResponse{ID: e.ID})
	}
	return &dto.ListFlowBoardResponse{Items: items, Total: len(items)}, nil
}
