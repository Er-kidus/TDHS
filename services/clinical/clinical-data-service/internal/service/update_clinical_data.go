package service

import (
	"context"
	"github.com/tenadam/clinical-data-service/internal/dto"
	"github.com/tenadam/clinical-data-service/internal/model"
	"github.com/tenadam/clinical-data-service/internal/validator"
)

// UpdateClinicalData validates and updates an existing clinical-data.
func (s *Service) UpdateClinicalData(ctx context.Context, req dto.UpdateClinicalDataRequest) (*dto.ClinicalDataResponse, error) {
	if err := validator.ValidateClinicalDataUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.ClinicalData{ID: req.ID}
	updated, err := s.repo.UpdateClinicalData(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClinicalDataResponse{ID: updated.ID}, nil
}
