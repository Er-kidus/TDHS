package service

import (
	"context"
	"github.com/tenadam/bed-management-service/internal/dto"
)

// ListBedManagements retrieves all bed-managements.
func (s *Service) ListBedManagements(ctx context.Context) (*dto.ListBedManagementResponse, error) {
	entities, err := s.repo.ListBedManagements(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.BedManagementResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.BedManagementResponse{ID: e.ID})
	}
	return &dto.ListBedManagementResponse{Items: items, Total: len(items)}, nil
}
