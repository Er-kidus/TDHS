package service

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/dto"
	"github.com/tenadam/inpatient-service/internal/model"
	"github.com/tenadam/inpatient-service/internal/validator"
)

// UpdateInpatient validates and updates an existing inpatient.
func (s *Service) UpdateInpatient(ctx context.Context, req dto.UpdateInpatientRequest) (*dto.InpatientResponse, error) {
	if err := validator.ValidateInpatientUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Inpatient{ID: req.ID}
	updated, err := s.repo.UpdateInpatient(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InpatientResponse{ID: updated.ID}, nil
}
