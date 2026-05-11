package service

import (
	"context"
	"github.com/tenadam/patient-service/internal/dto"
	"github.com/tenadam/patient-service/internal/model"
	"github.com/tenadam/patient-service/internal/validator"
)

// CreatePatient validates and creates a new patient.
func (s *Service) CreatePatient(ctx context.Context, req dto.CreatePatientRequest) (*dto.PatientResponse, error) {
	if err := validator.ValidatePatientCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Patient{}
	created, err := s.repo.CreatePatient(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PatientResponse{ID: created.ID}, nil
}
