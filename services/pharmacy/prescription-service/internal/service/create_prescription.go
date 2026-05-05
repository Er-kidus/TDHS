package service

import (
	"context"
	"github.com/tenadam/prescription-service/internal/dto"
	"github.com/tenadam/prescription-service/internal/model"
	"github.com/tenadam/prescription-service/internal/validator"
)

// CreatePrescription validates and creates a new prescription.
func (s *Service) CreatePrescription(ctx context.Context, req dto.CreatePrescriptionRequest) (*dto.PrescriptionResponse, error) {
	if err := validator.ValidatePrescriptionCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Prescription{}
	created, err := s.repo.CreatePrescription(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PrescriptionResponse{ID: created.ID}, nil
}
