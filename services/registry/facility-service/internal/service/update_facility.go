package service

import (
	"context"
	"github.com/tenadam/facility-service/internal/dto"
	"github.com/tenadam/facility-service/internal/model"
	"github.com/tenadam/facility-service/internal/validator"
)

// UpdateFacility validates and updates an existing facility.
func (s *Service) UpdateFacility(ctx context.Context, req dto.UpdateFacilityRequest) (*dto.FacilityResponse, error) {
	if err := validator.ValidateFacilityUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Facility{ID: req.ID}
	updated, err := s.repo.UpdateFacility(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FacilityResponse{ID: updated.ID}, nil
}
