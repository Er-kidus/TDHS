package service

import (
	"context"
	"github.com/tenadam/facility-service/internal/dto"
	"github.com/tenadam/facility-service/internal/model"
	"github.com/tenadam/facility-service/internal/validator"
)

// CreateFacility validates and creates a new facility.
func (s *Service) CreateFacility(ctx context.Context, req dto.CreateFacilityRequest) (*dto.FacilityResponse, error) {
	if err := validator.ValidateFacilityCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Facility{}
	created, err := s.repo.CreateFacility(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FacilityResponse{ID: created.ID}, nil
}
