package service

import (
	"context"
	"github.com/tenadam/insurance-eligibility-service/internal/dto"
	"github.com/tenadam/insurance-eligibility-service/internal/model"
	"github.com/tenadam/insurance-eligibility-service/internal/validator"
)

// UpdateInsuranceEligibility validates and updates an existing insurance-eligibility.
func (s *Service) UpdateInsuranceEligibility(ctx context.Context, req dto.UpdateInsuranceEligibilityRequest) (*dto.InsuranceEligibilityResponse, error) {
	if err := validator.ValidateInsuranceEligibilityUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.InsuranceEligibility{ID: req.ID}
	updated, err := s.repo.UpdateInsuranceEligibility(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InsuranceEligibilityResponse{ID: updated.ID}, nil
}
