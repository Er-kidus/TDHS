package service

import (
	"context"
	"github.com/tenadam/medication-administration-service/internal/dto"
	"github.com/tenadam/medication-administration-service/internal/model"
	"github.com/tenadam/medication-administration-service/internal/validator"
)

// UpdateMedicationAdministration validates and updates an existing medication-administration.
func (s *Service) UpdateMedicationAdministration(ctx context.Context, req dto.UpdateMedicationAdministrationRequest) (*dto.MedicationAdministrationResponse, error) {
	if err := validator.ValidateMedicationAdministrationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.MedicationAdministration{ID: req.ID}
	updated, err := s.repo.UpdateMedicationAdministration(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.MedicationAdministrationResponse{ID: updated.ID}, nil
}
