package service

import (
	"context"
	"github.com/tenadam/clinical-data-service/internal/dto"
	"github.com/tenadam/clinical-data-service/internal/model"
	"github.com/tenadam/clinical-data-service/internal/validator"
)

// CreateClinicalData validates and creates a new clinical-data.
func (s *Service) CreateClinicalData(ctx context.Context, req dto.CreateClinicalDataRequest) (*dto.ClinicalDataResponse, error) {
	if err := validator.ValidateClinicalDataCreate(req); err != nil {
		return nil, err
	}
	entity := &model.ClinicalData{}
	created, err := s.repo.CreateClinicalData(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClinicalDataResponse{ID: created.ID}, nil
}
