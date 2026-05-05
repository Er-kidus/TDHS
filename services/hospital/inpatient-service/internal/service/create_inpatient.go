package service

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/dto"
	"github.com/tenadam/inpatient-service/internal/model"
	"github.com/tenadam/inpatient-service/internal/validator"
)

// CreateInpatient validates and creates a new inpatient.
func (s *Service) CreateInpatient(ctx context.Context, req dto.CreateInpatientRequest) (*dto.InpatientResponse, error) {
	if err := validator.ValidateInpatientCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Inpatient{}
	created, err := s.repo.CreateInpatient(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InpatientResponse{ID: created.ID}, nil
}
