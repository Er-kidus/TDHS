package service

import (
	"context"
	"github.com/tenadam/organization-service/internal/dto"
)

// GetOrganization retrieves a single organization by ID.
func (s *Service) GetOrganization(ctx context.Context, id string) (*dto.OrganizationResponse, error) {
	entity, err := s.repo.GetOrganization(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.OrganizationResponse{ID: entity.ID}, nil
}
