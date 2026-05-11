package service

import (
	"context"
	"github.com/tenadam/organization-service/internal/dto"
	"github.com/tenadam/organization-service/internal/model"
	"github.com/tenadam/organization-service/internal/validator"
)

// CreateOrganization validates and creates a new organization.
func (s *Service) CreateOrganization(ctx context.Context, req dto.CreateOrganizationRequest) (*dto.OrganizationResponse, error) {
	if err := validator.ValidateOrganizationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Organization{}
	created, err := s.repo.CreateOrganization(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OrganizationResponse{ID: created.ID}, nil
}
