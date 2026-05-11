package service

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/dto"
)

// GetSurgeryScheduling retrieves a single surgery-scheduling by ID.
func (s *Service) GetSurgeryScheduling(ctx context.Context, id string) (*dto.SurgerySchedulingResponse, error) {
	entity, err := s.repo.GetSurgeryScheduling(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.SurgerySchedulingResponse{ID: entity.ID}, nil
}
