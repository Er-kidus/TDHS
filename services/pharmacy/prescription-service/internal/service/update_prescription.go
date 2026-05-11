package service

import (
	"context"
	"github.com/tenadam/prescription-service/internal/dto"
	"github.com/tenadam/prescription-service/internal/model"
	"github.com/tenadam/prescription-service/internal/validator"
)

// UpdatePrescription validates and updates an existing prescription.
func (s *Service) UpdatePrescription(ctx context.Context, req dto.UpdatePrescriptionRequest) (*dto.PrescriptionResponse, error) {
	if err := validator.ValidatePrescriptionUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Prescription{ID: req.ID}
	updated, err := s.repo.UpdatePrescription(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PrescriptionResponse{ID: updated.ID}, nil
}
