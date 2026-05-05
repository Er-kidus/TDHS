package service

import (
	"context"
	"github.com/tenadam/theatre-management-service/internal/dto"
	"github.com/tenadam/theatre-management-service/internal/model"
	"github.com/tenadam/theatre-management-service/internal/validator"
)

// UpdateTheatreManagement validates and updates an existing theatre-management.
func (s *Service) UpdateTheatreManagement(ctx context.Context, req dto.UpdateTheatreManagementRequest) (*dto.TheatreManagementResponse, error) {
	if err := validator.ValidateTheatreManagementUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.TheatreManagement{ID: req.ID}
	updated, err := s.repo.UpdateTheatreManagement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TheatreManagementResponse{ID: updated.ID}, nil
}
