package service

import (
	"context"
	"github.com/tenadam/insurance-eligibility-service/internal/dto"
)

// GetInsuranceEligibility retrieves a single insurance-eligibility by ID.
func (s *Service) GetInsuranceEligibility(ctx context.Context, id string) (*dto.InsuranceEligibilityResponse, error) {
	entity, err := s.repo.GetInsuranceEligibility(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.InsuranceEligibilityResponse{ID: entity.ID}, nil
}
