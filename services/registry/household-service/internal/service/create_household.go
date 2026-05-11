package service

import (
	"context"
	"github.com/tenadam/household-service/internal/dto"
	"github.com/tenadam/household-service/internal/model"
	"github.com/tenadam/household-service/internal/validator"
)

// CreateHousehold validates and creates a new household.
func (s *Service) CreateHousehold(ctx context.Context, req dto.CreateHouseholdRequest) (*dto.HouseholdResponse, error) {
	if err := validator.ValidateHouseholdCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Household{}
	created, err := s.repo.CreateHousehold(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.HouseholdResponse{ID: created.ID}, nil
}
