package service

import (
	"context"
	"github.com/tenadam/access-control-service/internal/dto"
)

// GetAccessControl retrieves a single access-control by ID.
func (s *Service) GetAccessControl(ctx context.Context, id string) (*dto.AccessControlResponse, error) {
	entity, err := s.repo.GetAccessControl(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AccessControlResponse{ID: entity.ID}, nil
}
