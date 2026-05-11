package service

import (
	"context"
	"github.com/tenadam/bed-management-service/internal/dto"
	"github.com/tenadam/bed-management-service/internal/model"
	"github.com/tenadam/bed-management-service/internal/validator"
)

// UpdateBedManagement validates and updates an existing bed-management.
func (s *Service) UpdateBedManagement(ctx context.Context, req dto.UpdateBedManagementRequest) (*dto.BedManagementResponse, error) {
	if err := validator.ValidateBedManagementUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.BedManagement{ID: req.ID}
	updated, err := s.repo.UpdateBedManagement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.BedManagementResponse{ID: updated.ID}, nil
}
