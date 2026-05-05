package service

import (
	"context"
	"github.com/tenadam/flow-board-service/internal/dto"
)

// GetFlowBoard retrieves a single flow-board by ID.
func (s *Service) GetFlowBoard(ctx context.Context, id string) (*dto.FlowBoardResponse, error) {
	entity, err := s.repo.GetFlowBoard(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.FlowBoardResponse{ID: entity.ID}, nil
}
