package service

import (
	"context"
	"github.com/tenadam/shift-handoff-service/internal/dto"
)

// ListShiftHandoffs retrieves all shift-handoffs.
func (s *Service) ListShiftHandoffs(ctx context.Context) (*dto.ListShiftHandoffResponse, error) {
	entities, err := s.repo.ListShiftHandoffs(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ShiftHandoffResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ShiftHandoffResponse{ID: e.ID})
	}
	return &dto.ListShiftHandoffResponse{Items: items, Total: len(items)}, nil
}
