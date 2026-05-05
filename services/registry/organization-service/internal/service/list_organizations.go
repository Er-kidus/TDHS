package service

import (
	"context"
	"github.com/tenadam/organization-service/internal/dto"
)

// ListOrganizations retrieves all organizations.
func (s *Service) ListOrganizations(ctx context.Context) (*dto.ListOrganizationResponse, error) {
	entities, err := s.repo.ListOrganizations(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.OrganizationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.OrganizationResponse{ID: e.ID})
	}
	return &dto.ListOrganizationResponse{Items: items, Total: len(items)}, nil
}
