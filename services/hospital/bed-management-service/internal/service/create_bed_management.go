package service

import (
	"context"
	"github.com/tenadam/bed-management-service/internal/dto"
	"github.com/tenadam/bed-management-service/internal/model"
	"github.com/tenadam/bed-management-service/internal/validator"
)

// CreateBedManagement validates and creates a new bed-management.
func (s *Service) CreateBedManagement(ctx context.Context, req dto.CreateBedManagementRequest) (*dto.BedManagementResponse, error) {
	if err := validator.ValidateBedManagementCreate(req); err != nil {
		return nil, err
	}
	entity := &model.BedManagement{}
	created, err := s.repo.CreateBedManagement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.BedManagementResponse{ID: created.ID}, nil
}
