package service

import (
	"context"
	"github.com/tenadam/clinical-guideline-service/internal/dto"
	"github.com/tenadam/clinical-guideline-service/internal/model"
	"github.com/tenadam/clinical-guideline-service/internal/validator"
)

// UpdateClinicalGuideline validates and updates an existing clinical-guideline.
func (s *Service) UpdateClinicalGuideline(ctx context.Context, req dto.UpdateClinicalGuidelineRequest) (*dto.ClinicalGuidelineResponse, error) {
	if err := validator.ValidateClinicalGuidelineUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.ClinicalGuideline{ID: req.ID}
	updated, err := s.repo.UpdateClinicalGuideline(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClinicalGuidelineResponse{ID: updated.ID}, nil
}
