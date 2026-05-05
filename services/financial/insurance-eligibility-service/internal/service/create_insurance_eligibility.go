package service

import (
	"context"
	"github.com/tenadam/insurance-eligibility-service/internal/dto"
	"github.com/tenadam/insurance-eligibility-service/internal/model"
	"github.com/tenadam/insurance-eligibility-service/internal/validator"
)

// CreateInsuranceEligibility validates and creates a new insurance-eligibility.
func (s *Service) CreateInsuranceEligibility(ctx context.Context, req dto.CreateInsuranceEligibilityRequest) (*dto.InsuranceEligibilityResponse, error) {
	if err := validator.ValidateInsuranceEligibilityCreate(req); err != nil {
		return nil, err
	}
	entity := &model.InsuranceEligibility{}
	created, err := s.repo.CreateInsuranceEligibility(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InsuranceEligibilityResponse{ID: created.ID}, nil
}
