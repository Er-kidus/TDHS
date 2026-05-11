package service

import (
	"context"
	"github.com/tenadam/insurance-eligibility-service/internal/dto"
)

// ListInsuranceEligibilitys retrieves all insurance-eligibilitys.
func (s *Service) ListInsuranceEligibilitys(ctx context.Context) (*dto.ListInsuranceEligibilityResponse, error) {
	entities, err := s.repo.ListInsuranceEligibilitys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.InsuranceEligibilityResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.InsuranceEligibilityResponse{ID: e.ID})
	}
	return &dto.ListInsuranceEligibilityResponse{Items: items, Total: len(items)}, nil
}
