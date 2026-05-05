package service

import (
	"context"
	"github.com/tenadam/medication-service/internal/dto"
	"github.com/tenadam/medication-service/internal/model"
	"github.com/tenadam/medication-service/internal/validator"
)

// UpdateMedication validates and updates an existing medication.
func (s *Service) UpdateMedication(ctx context.Context, req dto.UpdateMedicationRequest) (*dto.MedicationResponse, error) {
	if err := validator.ValidateMedicationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Medication{ID: req.ID}
	updated, err := s.repo.UpdateMedication(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.MedicationResponse{ID: updated.ID}, nil
}
