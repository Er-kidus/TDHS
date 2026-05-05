package service

import (
	"context"
	"github.com/tenadam/organization-service/internal/dto"
	"github.com/tenadam/organization-service/internal/model"
	"github.com/tenadam/organization-service/internal/validator"
)

// UpdateOrganization validates and updates an existing organization.
func (s *Service) UpdateOrganization(ctx context.Context, req dto.UpdateOrganizationRequest) (*dto.OrganizationResponse, error) {
	if err := validator.ValidateOrganizationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Organization{ID: req.ID}
	updated, err := s.repo.UpdateOrganization(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OrganizationResponse{ID: updated.ID}, nil
}
