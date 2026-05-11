package service

import (
	"context"
	"github.com/tenadam/household-service/internal/dto"
	"github.com/tenadam/household-service/internal/model"
	"github.com/tenadam/household-service/internal/validator"
)

// UpdateHousehold validates and updates an existing household.
func (s *Service) UpdateHousehold(ctx context.Context, req dto.UpdateHouseholdRequest) (*dto.HouseholdResponse, error) {
	if err := validator.ValidateHouseholdUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Household{ID: req.ID}
	updated, err := s.repo.UpdateHousehold(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.HouseholdResponse{ID: updated.ID}, nil
}
