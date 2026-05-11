package service

import (
	"context"
	"github.com/tenadam/patient-service/internal/dto"
	"github.com/tenadam/patient-service/internal/model"
	"github.com/tenadam/patient-service/internal/validator"
)

// UpdatePatient validates and updates an existing patient.
func (s *Service) UpdatePatient(ctx context.Context, req dto.UpdatePatientRequest) (*dto.PatientResponse, error) {
	if err := validator.ValidatePatientUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Patient{ID: req.ID}
	updated, err := s.repo.UpdatePatient(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PatientResponse{ID: updated.ID}, nil
}
