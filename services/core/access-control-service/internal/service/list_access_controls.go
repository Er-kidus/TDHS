package service

import (
	"context"
	"github.com/tenadam/access-control-service/internal/dto"
)

// ListAccessControls retrieves all access-controls.
func (s *Service) ListAccessControls(ctx context.Context) (*dto.ListAccessControlResponse, error) {
	entities, err := s.repo.ListAccessControls(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AccessControlResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AccessControlResponse{ID: e.ID})
	}
	return &dto.ListAccessControlResponse{Items: items, Total: len(items)}, nil
}
