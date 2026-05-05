package service

import (
	"context"
	"github.com/tenadam/procurement-service/internal/dto"
	"github.com/tenadam/procurement-service/internal/model"
	"github.com/tenadam/procurement-service/internal/validator"
)

// CreateProcurement validates and creates a new procurement.
func (s *Service) CreateProcurement(ctx context.Context, req dto.CreateProcurementRequest) (*dto.ProcurementResponse, error) {
	if err := validator.ValidateProcurementCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Procurement{}
	created, err := s.repo.CreateProcurement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProcurementResponse{ID: created.ID}, nil
}
