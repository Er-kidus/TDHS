package service

import (
	"context"
	"github.com/tenadam/theatre-management-service/internal/dto"
	"github.com/tenadam/theatre-management-service/internal/model"
	"github.com/tenadam/theatre-management-service/internal/validator"
)

// CreateTheatreManagement validates and creates a new theatre-management.
func (s *Service) CreateTheatreManagement(ctx context.Context, req dto.CreateTheatreManagementRequest) (*dto.TheatreManagementResponse, error) {
	if err := validator.ValidateTheatreManagementCreate(req); err != nil {
		return nil, err
	}
	entity := &model.TheatreManagement{}
	created, err := s.repo.CreateTheatreManagement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TheatreManagementResponse{ID: created.ID}, nil
}
