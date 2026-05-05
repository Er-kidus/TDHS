package service

import (
	"context"
	"github.com/tenadam/clinical-guideline-service/internal/dto"
)

// GetClinicalGuideline retrieves a single clinical-guideline by ID.
func (s *Service) GetClinicalGuideline(ctx context.Context, id string) (*dto.ClinicalGuidelineResponse, error) {
	entity, err := s.repo.GetClinicalGuideline(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ClinicalGuidelineResponse{ID: entity.ID}, nil
}
