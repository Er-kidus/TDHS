package service

import (
	"context"
	"github.com/tenadam/medication-administration-service/internal/dto"
	"github.com/tenadam/medication-administration-service/internal/model"
	"github.com/tenadam/medication-administration-service/internal/validator"
)

// CreateMedicationAdministration validates and creates a new medication-administration.
func (s *Service) CreateMedicationAdministration(ctx context.Context, req dto.CreateMedicationAdministrationRequest) (*dto.MedicationAdministrationResponse, error) {
	if err := validator.ValidateMedicationAdministrationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.MedicationAdministration{}
	created, err := s.repo.CreateMedicationAdministration(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.MedicationAdministrationResponse{ID: created.ID}, nil
}
