package service

import (
	"context"
	"github.com/tenadam/clinical-guideline-service/internal/dto"
)

// ListClinicalGuidelines retrieves all clinical-guidelines.
func (s *Service) ListClinicalGuidelines(ctx context.Context) (*dto.ListClinicalGuidelineResponse, error) {
	entities, err := s.repo.ListClinicalGuidelines(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ClinicalGuidelineResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ClinicalGuidelineResponse{ID: e.ID})
	}
	return &dto.ListClinicalGuidelineResponse{Items: items, Total: len(items)}, nil
}
