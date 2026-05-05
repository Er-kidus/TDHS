package service

import (
	"context"
	"github.com/tenadam/medication-service/internal/dto"
	"github.com/tenadam/medication-service/internal/model"
	"github.com/tenadam/medication-service/internal/validator"
)

// CreateMedication validates and creates a new medication.
func (s *Service) CreateMedication(ctx context.Context, req dto.CreateMedicationRequest) (*dto.MedicationResponse, error) {
	if err := validator.ValidateMedicationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Medication{}
	created, err := s.repo.CreateMedication(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.MedicationResponse{ID: created.ID}, nil
}
