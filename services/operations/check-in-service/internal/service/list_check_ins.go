package service

import (
	"context"
	"github.com/tenadam/check-in-service/internal/dto"
)

// ListCheckIns retrieves all check-ins.
func (s *Service) ListCheckIns(ctx context.Context) (*dto.ListCheckInResponse, error) {
	entities, err := s.repo.ListCheckIns(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.CheckInResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.CheckInResponse{ID: e.ID})
	}
	return &dto.ListCheckInResponse{Items: items, Total: len(items)}, nil
}
