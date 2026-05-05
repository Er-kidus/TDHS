package service

import (
	"context"
	"github.com/tenadam/clinical-guideline-service/internal/dto"
	"github.com/tenadam/clinical-guideline-service/internal/model"
	"github.com/tenadam/clinical-guideline-service/internal/validator"
)

// CreateClinicalGuideline validates and creates a new clinical-guideline.
func (s *Service) CreateClinicalGuideline(ctx context.Context, req dto.CreateClinicalGuidelineRequest) (*dto.ClinicalGuidelineResponse, error) {
	if err := validator.ValidateClinicalGuidelineCreate(req); err != nil {
		return nil, err
	}
	entity := &model.ClinicalGuideline{}
	created, err := s.repo.CreateClinicalGuideline(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClinicalGuidelineResponse{ID: created.ID}, nil
}
